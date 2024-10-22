"use client";

import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import * as xlsx from "xlsx";

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

    const [excelFile, setExcelFile] = useState([]);

    const [masterForCampusId, setMasterForCampusId] = useState('');

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

        const requestClassData = {
            member_no: orderRes,
            class_list: inputItems
        };

        const classRes = await createClass(requestClassData);
    };


    // 엑셀 업로드
    const onChangeExcelUpload = async (files) => {
        console.log('files', files);

        if (files.length > 0) {
            const file = files[0];

            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = xlsx.read(data, { type: "array", bookVBA: true });

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(sheet);

                setExcelFile(jsonData);
                console.log('excelFile', excelFile);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    // 저장 버튼 클릭 시 엑셀 API 호출
    const onClickSubmitExcel = async () => {
        const requestData = {
            master_id: masterForCampusId,
            list: excelFile
        };

        await createMembers(requestData);
    };

    const createMembers = async (data) => {
        const response = await axios.post("/api/member", data);
        if (response.data.code !== 200) {
            alert(response.data.msg);
            return;
        } else {
            alert(response.data.msg);
            window.location.reload();
        }
    };

    useEffect(() => {
        if (excelFile.length > 0) {
            console.log('Excel 파일 데이터:', excelFile);
            // 여기서 excelFile을 사용하는 추가 로직 구현
        }
    }, [excelFile]);

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
                        <div key={index}>
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
                <h1>학생 계정 생성 & 클래스 배정</h1>
                <span></span>
                <div>원장님 ID&nbsp;
                    <input
                        type="text"
                        onChange={(e) => setMasterForCampusId(e.target.value)}
                    />
                </div>
                <div>엑셀 업로드&nbsp;
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={(e) => onChangeExcelUpload(e.target.files)}
                    />
                    <span>샘플 파일 다운로드</span>
                </div>
                <button onClick={onClickSubmitExcel}>저장</button>
            </div>
        </div>
    );
}

