import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs';
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import formidable from "formidable";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../../env/server.mjs";
import { s3Client } from "../../../server/lib/s3";

import { prisma } from "../../../server/db/client";

export const config = {
    api: {
        bodyParser: false,
    }
}

const getFormFile = async (req: NextApiRequest): Promise<formidable.File> => {
    return new Promise((res, rej) => {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                rej(err);
            }

            if (!files.icon) {
                rej(new Error('No file found'));
            }

            res(files.icon as formidable.File);
        });
    });
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Handle the image upload for a product
    if (req.method !== "POST") {
        res.status(405).end();
        return;
    }

    const productId = req.query.productId as string;

    if (!productId) {
        res.status(400).end();
        return;
    }

    const session = await getServerSession(req, res, nextAuthOptions);

    if (!session) {
        res.status(401).end();
        return;
    }

    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        }
    });

    if (!product) {
        res.status(404).end();
        return;
    }

    if (product.ownerId !== session.user?.id) {
        res.status(403).end();
        return;
    }

    try {
        const data = await getFormFile(req);

        const stream = fs.createReadStream(data.filepath);

        const fileExt = data?.originalFilename?.split(".").pop();

        // Remove previous icon if it exists
        if (product.icon) {

            // https://averyplugins.us-southeast-1.linodeobjects.com/plugins/${productId}/icon.${fileExt}
            // Get the file extension from the previous icon
            const previousFileExt = product.icon.split(".").pop();


            const deleteCmd = new DeleteObjectCommand({
                Bucket: env.S3_PLUGIN_BUCKET,
                Key: `plugins/${product.id}/icon.${previousFileExt}`,
            });

            await s3Client.send(deleteCmd);
        }


        const putObjectCmd = new PutObjectCommand({
            Bucket: env.S3_PLUGIN_BUCKET,
            Key: `plugins/${productId}/icon.${fileExt}`,
            Body: stream,
            ACL: "public-read"
        });

        await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                icon: `https://averyplugins.us-southeast-1.linodeobjects.com/plugins/${productId}/icon.${fileExt}`,
            }
        })

        await s3Client.send(putObjectCmd);
        res.status(200).end();
    }
    catch (err) {
        console.error(err);
        res.status(500).end();
        return;
    }
}