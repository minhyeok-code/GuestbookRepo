'use client'

import { useEffect, useState } from "react"
import AddGuestBook from "./guestbook/components/AddGuestBook";
import List from "./guestbook/components/List";

export default function Home() {
    const [guestbooks, setGuestBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuestbooks = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                const response = await fetch(`${apiUrl}/api/book`);
                if (!response) throw new Error("데이터 로딩 실패");
                const data = await response.json();
                setGuestBooks(data);
            } catch (err) {
                console.error("불러오기 실패 : ", err)
            } finally {
                setLoading(false);
            }
        }
        fetchGuestbooks()
    }, []);

    const AddGuestBooks = (newEntry) => {
        setGuestBooks((prev) => [...prev, newEntry]);
    };

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* 헤더 섹션 */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#ff6b9d] via-[#c792ea] to-[#7ee8fa] bg-clip-text text-transparent">
                        ✨ Guestbook
                    </h1>
                    <p className="text-[#a0a0b0] text-lg">
                        소중한 메시지를 남겨주세요
                    </p>
                    <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-[#ff6b9d] to-[#7ee8fa] rounded-full"></div>
                </header>

                {/* 입력 폼 */}
                <section className="mb-12">
                    <AddGuestBook onAdd={AddGuestBooks} />
                </section>

                {/* 방명록 목록 */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1 bg-gradient-to-b from-[#ff6b9d] to-[#c792ea] rounded-full"></div>
                        <h2 className="text-xl font-semibold text-[#e8e6e3]">
                            방명록 
                            <span className="ml-2 text-sm font-normal text-[#7ee8fa]">
                                ({guestbooks.length}개의 메시지)
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-8 h-8 border-4 border-[#ff6b9d] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <List guestbooks={guestbooks} />
                    )}
                </section>

                {/* 푸터 */}
                <footer className="mt-16 text-center text-sm text-[#6a6a7a]">
                    <p>Thanks for visit my room baaaaaaaAAaaAaammmmMM</p>
                </footer>
            </div>
        </main>
    )
}
