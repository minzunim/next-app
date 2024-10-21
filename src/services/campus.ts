import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCampusList = async (member_no: number) => {

    const campus_list = await prisma.campas.findMany({
        where: {
            register: member_no,
            status: "Y",
            is_deleted: "N"
        }
    });

    return campus_list;
};
