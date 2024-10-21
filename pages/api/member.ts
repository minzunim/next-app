import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getCampusList } from "@/src/services/campus";

const prisma = new PrismaClient();

// 멤버 인서트
export default async function createMember(req: NextApiRequest, res: NextApiResponse) {

    //
}