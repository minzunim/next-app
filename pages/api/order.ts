import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getCampusList } from "@/src/services/campus";

const prisma = new PrismaClient();

// 요금제 연결 api
export default async function createOrder(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        const { master_id, product_no, expire_date, student_count } = req.body;

        const member_list = await prisma.member.findMany({
            where: {
                id: master_id,
                is_deleted: "N"
            }
        });

        if (!member_list.length) res.json({ code: 400, msg: `해당하는 원장님 아이디가 없습니다`, data: null });
        if (member_list.length > 1) res.json({ code: 400, msg: `원장님 아이디를 정확하게 입력해주세요`, data: member_list });

        const member_no = member_list[0].idx;

        const campus_list = await getCampusList(member_no);

        if (!campus_list.length) res.json({ code: 400, msg: `캠퍼스가 없습니다`, data: null });
        if (campus_list.length > 1) res.json({ code: 400, msg: `유효한 캠퍼스가 2개 이상입니다`, data: campus_list });

        const campus_no = campus_list[0].idx;

        const product_data = await prisma.product.findUnique({
            where: {
                idx: product_no
            }
        });

        if (!product_data) res.json({ code: 400, msg: `해당하는 요금제가 없습니다`, data: null });

        const price = product_data?.pr_original_price!;
        const product_code = product_data?.code!;

        const now = new Date();

        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');

        const yymmdd = `${year}-${month}-${day}`;

        let order_no = 0;

        await prisma.$transaction(async (tx) => {
            // 요금제 인서트
            const order = await tx.order.create({
                data: {
                    type: 1,
                    product_no,
                    product_code,
                    original_price: price,
                    sale_price: price,
                    price,
                    pay: price,
                    balance: 0,
                    order: member_no,
                    status: 1,
                    expire_date: (new Date(expire_date)).toISOString()
                }
            });

            order_no = order.idx;

            console.log('order_no', order_no);
            if (!order_no) res.json({ code: 500, msg: `주문 건 생성 실패`, data: order_no });

            // campas_subscrip 인서트
            const subscrip = await tx.campas_subscrip.create({
                data: {
                    campas_no: campus_no,
                    order_no,
                    start_date: (new Date(yymmdd)).toISOString(),
                    expire_date: (new Date(expire_date)).toISOString(),
                    register: member_no
                }
            });
            if (!subscrip.idx) res.json({ code: 500, msg: `캠퍼스 구독 정보 생성 실패`, data: subscrip });

            const updateCampus = await tx.campas.update({
                where: {
                    idx: campus_no
                },
                data: {
                    student_count
                }
            });

            if (!updateCampus.idx) res.json({ code: 500, msg: `캠퍼스 학생 수 업데이트 실패`, data: updateCampus });
        });

        res.json({ code: 200, msg: `성공`, data: member_no });

    } else {

    }
}