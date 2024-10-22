import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMemberNoById = async (master_id: string) => {

    const member = await prisma.member.findMany({
        where: {
            id: master_id,
            status: "Y",
            is_deleted: "N"
        }
    });

    return member;
};
