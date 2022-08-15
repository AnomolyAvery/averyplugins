import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import fs from 'fs';

import { prisma } from '../../../server/db/client';
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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

            if (!files.product_file) {
                rej(new Error('No file found'));
            }

            res(files.product_file as formidable.File);
        });
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, nextAuthOptions);

        if (!session) {
            res.status(401).end();
            return;
        }

        if (req.method !== "POST" && req.method !== "PUT") {
            res.status(405).end();
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

        const file = await getFormFile(req);

        if (!file) {
            res.status(400).end();
            return;
        }

        const stream = fs.createReadStream(file.filepath);

        if (req.method === "PUT") {
            const fileId = req.query.fileId as string;

            if (!fileId) {
                res.status(400).end();
                return;
            }

            const file = await prisma.productFile.findFirst({
                where: {
                    id: fileId,
                    productId,
                }
            });

            if (!file) {
                res.status(404).end();
                return;
            }

            const deleteObjCmd = new DeleteObjectCommand({
                Bucket: env.S3_PLUGIN_BUCKET,
                Key: file.fileKey,
            });

            await s3Client.send(deleteObjCmd);
        }

        const fileExt = file.originalFilename?.split(".").pop();

        const fileName = `${productId}_file_${Date.now()}.${fileExt}`;

        const fileKey = `plugins/${product.id}/files/${fileName}`;

        const putObjectCmd = new PutObjectCommand({
            Bucket: env.S3_PLUGIN_BUCKET,
            Key: fileKey,
            Body: stream,
        });

        await s3Client.send(putObjectCmd);

        if (req.method === "POST") {
            const file = await prisma.productFile.create({
                data: {
                    productId,
                    fileKey,
                    message: "",
                    name: "",
                    version: "",
                },
                select: {
                    id: true,
                }
            });

            return res.status(201).json({
                fileId: file.id,
            });
        }

        return res.status(200).end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
}