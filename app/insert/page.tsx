"use client";

import React, { useState } from "react";

export default function Campus() {

    const [masterId, setMasterId] = useState('');
    const [productIdx, setProductIdx] = useState<number | string>('');
    const [expireDate, setExpireDate] = useState('');

    console.log('masterId', masterId);
    console.log('productIdx', productIdx);
    console.log('expireDate', expireDate);

    return (
        <div>
            <form>
                <h1>요금제 연결</h1>
                <div>원장님 ID&nbsp;
                    <input
                        type="text"
                        value={masterId}
                        onChange={(e) => (setMasterId(e.target.value))}
                    />
                </div>
                <div>요금제 고유 번호(idx)&nbsp;
                    <input
                        type="number"
                        value={productIdx}
                        onChange={(e) => (setProductIdx(Number(e.target.value)))}
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
                <button>insert</button>
            </form>
        </div >

    );
}

