import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getCampusList } from "@/src/services/campus";
import { getCurrentDate } from "@/src/utils/function";

const prisma = new PrismaClient();

// 클래스 생성 api
export default async function createClass(req: NextApiRequest, res: NextApiResponse) {

    // 클래스 타이틀, 학생수, 선생님 
    if (req.method === 'POST') {

        const member_no = req.body.member_no;
        const class_list = req.body.class_list;

        // 캠퍼스 찾음
        const campus_list = await getCampusList(member_no);

        if (!campus_list.length) res.json({ code: 400, msg: `캠퍼스가 없습니다`, data: null });
        if (campus_list.length > 1) res.json({ code: 400, msg: `유효한 캠퍼스가 2개 이상입니다`, data: campus_list });

        const campus_no = campus_list[0].idx;

        const _class_list = class_list.map((item: any) => ({
            ...item,
            campas_no: campus_no,
            color_hex: "#ffaa04",
            teacher_no: member_no,
            register: member_no,
            register_date: getCurrentDate()
        }));

        _class_list.forEach((el: any) => {
            delete el['id'];
        });

        console.log('class_list', class_list);

        // 클래스 생성
        const classes = await prisma.campas_class.createMany({
            data: _class_list
        });

        res.json({ code: 200, msg: `클래스 생성 완료`, data: null });

    } else {

    }

}