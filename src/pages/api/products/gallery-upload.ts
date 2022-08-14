import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import formidable from "formidable";
import { prisma } from '../../../server/db/client';
import fs from 'fs';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../../env/server.mjs";
import { s3Client } from "../../../server/lib/s3";

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

            if (!files.gallery_image) {
                rej(new Error('No file found'));
            }

            res(files.gallery_image as formidable.File);
        });
    });
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end();
        return;
    }

    const session = await getServerSession(req, res, nextAuthOptions);

    if (!session) {
        res.status(401).end();
        return;
    }

    const productId = req.query.productId as string;

    if (!productId) {
        res.status(400).end();
        return;
    }

    const product = await prisma.product.findUnique({
        where: {
            id: productId
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

        const fileExt = data.originalFilename?.split(".").pop();

        const fileName = `${productId}_${Date.now()}.${fileExt}`;

        const putObjectCmd = new PutObjectCommand({
            Bucket: env.S3_PLUGIN_BUCKET,
            Key: `plugins/${product.id}/gallery/${fileName}`,
            Body: stream,
            ACL: 'public-read',
        });

        await s3Client.send(putObjectCmd);

        const img = await prisma.productImage.create({
            data: {
                product: {
                    connect: {
                        id: product.id,
                    }
                },
                url: `https://averyplugins.us-southeast-1.linodeobjects.com/plugins/${productId}/gallery/${fileName}`,
            },
            select: {
                id: true,
            }
        });

        res.status(200).json({
            img
        });

    }
    catch (err) {
        res.status(500).json(err);
    }
}