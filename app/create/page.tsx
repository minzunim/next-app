"use client";

import axios from "axios";
import React, { useRef, useState } from "react";

interface CreateOrder {
    master_id: string;
    product_no: number | string;
    expire_date: string;
};

interface InputItem {
    id: number;
    title: string;
    student_count: number;
    campas_no: number;
    color_hex: string;
    register: number;
}

interface creatClass {
    member_no: number;
    class_list: InputItem[];
}


export default function Campus() {

    const [masterId, setMasterId] = useState('');
    const [studentCount, setStudentCount] = useState<number | string>('');
    const [productNo, setProductNo] = useState<number | string>('');
    const [expireDate, setExpireDate] = useState('');

    const nextId = useRef<number>(1);

    const [inputItems, setInputItems] = useState<InputItem[]>([{
        id: 0,
        title: '',
        student_count: 0,
        campas_no: 0,
        color_hex: '',
        register: 0
    }]);

    // input 추가
    const addInput = () => {
        const input = {
            id: nextId.current,
            title: '',
            student_count: 0,
            campas_no: 0,
            color_hex: '',
            register: 0
        };

        setInputItems([...inputItems, input]);
        console.log('inputItems', inputItems);

        nextId.current += 1;
    };

    // input 삭제
    const deleteInput = (index: number) => {
        setInputItems(inputItems.filter(item => item.id !== index));
        // console.log('inputItems', inputItems);
    };


    const onChangeClassInput = (e: React.ChangeEvent<HTMLInputElement>, index: number, option: "title" | "student_count") => {
        if (index > inputItems.length) return;

        const inputItemCopy: InputItem[] = JSON.parse(JSON.stringify(inputItems));
        console.log('e.target', e.target);

        if (option === "title") {
            inputItemCopy[index].title = e.target.value;
        } else {
            inputItemCopy[index].student_count = parseInt(e.target.value);
        }

        setInputItems(inputItemCopy);
        console.log('inputItems', inputItems);
    };


    const createOrder = async (data: CreateOrder) => {
        const response = await axios.post("/api/order", data);

        if (response.data.code !== 200) {
            alert(response.data.msg);
            return;
        }
        console.log('response.data.data', response.data.data);

        return response.data.data;
    };

    const createClass = async (data: creatClass) => {
        const response = await axios.post("/api/class", data);

        if (response.data.code !== 200) {
            alert(response.data.msg);
            return;
        } else {
            alert(response.data.msg);
            window.location.reload();
        }
    };

    const onClickSubmitOrder = async () => {
        const requestOrderData = {
            master_id: masterId,
            product_no: productNo,
            expire_date: expireDate
        };

        const orderRes = await createOrder(requestOrderData);
        console.log("🚀 ~ orderRes:", orderRes);

        const requestClassData = {
            member_no: orderRes,
            class_list: inputItems
        };

        const classRes = await createClass(requestClassData);
        console.log("🚀 ~ classRes:", classRes);
    };

    return (
        <div>
            <div>
                <h1>요금제 연결 & 클래스 생성</h1>
                <span></span>
                <div>원장님 ID&nbsp;
                    <input
                        type="text"
                        value={masterId}
                        onChange={(e) => (setMasterId(e.target.value))}
                    />
                </div>
                <div>
                    학생수&nbsp;
                    <input
                        type="number"
                        value={studentCount}
                        onChange={(e) => (setStudentCount(Number(e.target.value)))}
                    />
                </div>
                <div>요금제 고유 번호(idx)&nbsp;
                    <input
                        type="number"
                        value={productNo}
                        onChange={(e) => (setProductNo(Number(e.target.value)))}
                    />
                </div>
                <div>
                    만료일&nbsp;
                    <input
                        type="date"
                        value={expireDate}
                        onChange={(e) => (setExpireDate(e.target.value))}
                    />
                </div>
                <div>클래스 생성</div>
                {
                    inputItems.map((item, index) => (
                        <div>
                            <input
                                type="text"
                                onChange={e => onChangeClassInput(e, index, "title")}
                                placeholder="클래스 명"
                                value={item.title}
                            />
                            <input
                                type="number"
                                onChange={e => onChangeClassInput(e, index, "student_count")}
                                placeholder="학생수"
                                value={item.student_count}
                            />
                            <button onClick={addInput}>+</button>
                            {
                                index > 0 && <button onClick={() => deleteInput(item.id)}>-</button>
                            }
                        </div>
                    ))
                }
                <button onClick={onClickSubmitOrder}>저장</button>
            </div>
            <hr></hr>
            <div>
            </div>
        </div >

    );
}

