import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 요금제 연결 api
export function insertOrder(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

    } else {

    }
}
// 계정 생성 api
export async function createMember(req: NextApiRequest, res) {
    if (req.method === 'POST') {

        const { first_name, last_name } = req.body;

        const newUser = await prisma.actor.create({
            data: {
                first_name,
                last_name,
            }
        });
        res.status(200).json(newUser);
    } else {

    }
}