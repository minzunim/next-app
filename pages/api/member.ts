import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getCampusList } from "@/src/services/campus";
import { getMemberNoById } from "@/src/services/member";
import { getCurrentDate } from "@/src/utils/function";
import crypto from "crypto";

const prisma = new PrismaClient();

// 멤버 인서트
export default async function createMember(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === 'POST') {

        // input - 원장님 아이디로 유효 캠퍼스 찾기
        const master_id = req.body.master_id;
        const excel_list = req.body.list;

        const id_list = excel_list.map((item) => item.id);

        // 우선 id가 동일한 게 이미 db에 있는지 확인
        const isExistId = await prisma.member.findMany({
            where: {
                id: {
                    in: id_list
                }
            }
        });

        if (isExistId.length > 0) return res.json({ code: 400, msg: `중복되는 아이디가 있습니다.`, data: isExistId });

        const member = await getMemberNoById(master_id);

        if (!member.length) return res.json({ code: 400, msg: `해당하는 원장님 아이디가 없습니다.`, data: null });

        const member_no = member[0].idx;
        const campus_list = await getCampusList(member_no);

        if (!campus_list.length) return res.json({ code: 400, msg: `해당하는 캠퍼스가 없습니다.`, data: null });
        if (campus_list.length > 1) return res.json({ code: 400, msg: `유효한 캠퍼스가 2개 이상입니다.`, data: null });

        const campus_no = campus_list[0].idx;

        const password = crypto
            .createHmac("sha256", "cedu2022")
            .update(excel_list[0]['비밀번호'] + "")
            .digest("hex");

        let _excel_list = excel_list.map((item) => ({
            type: 0,
            id: item.id,
            password,
            name: item['이름'],
            register_date: getCurrentDate()
        }));

        console.log('_excel_list', _excel_list);

        // 학생 계정 대량 생성 - member
        await prisma.$transaction(async (tx) => {

            // 임시로 주석
            const members = await tx.member.createMany({
                data: _excel_list
            });

            const member_list = await tx.member.findMany({
                where: {
                    id: {
                        in: id_list
                    }
                }
            });

            const member_no_list = member_list.map((item) => ({
                campas_no: campus_no,
                type: 0,
                member_no: item.idx,
                register_date: getCurrentDate()
            }));

            // 생성된 member_id bulk 로 campas_member 로 인서트
            const campas_members = await tx.campas_member.createMany({
                data: member_no_list
            });

            // campas_class_student 인서트 (campas_no, class_no, member_no)
            // 기존 엑셀 데이터에 삽입해야 함
            // campas_no랑 class 이름으로 class_no 찾기
            for (const row of excel_list) {
                const class_no_list = await tx.campas_class.findMany({
                    where: {
                        campas_no: campus_no,
                        title: row['클래스명']
                    }
                });

                // 새로운 excel_list 반환
                row.c_class_no = class_no_list[0].idx;

                member_list.forEach((item) => {
                    if (item.id === row.id) {
                        row.member_no = item.idx;
                    }
                });
            }

            console.log('exel_list 반환', excel_list);

            _excel_list = excel_list.map((item) => ({
                student_no: item.member_no,
                c_class_no: item.c_class_no
            }));

            const campas_class_student = await tx.campas_class_student.createMany({
                data: _excel_list
            });

            res.json({ code: 200, msg: `학생 계정 생성 및 클래스 배정 성공`, data: null });
        });
    } else {

    }

}