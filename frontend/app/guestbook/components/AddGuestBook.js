'use client'

import { useState } from "react"

function AddGuestBook({ onAdd }) {
    const [guestbook, setGuestBook] = useState({
        nickname: '',
        content: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGuestBook((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        if (!guestbook.nickname.trim() || !guestbook.content.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/api/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(guestbook),
            })
            if (!response.ok) {
                throw new Error('서버 응답 실패!');
            }

            const savedEntry = await response.json();
            onAdd(savedEntry)

            setGuestBook({
                nickname: '',
                content: '',
            });
        } catch (error) {
            console.error('에러발생', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const isFormValid = guestbook.nickname.trim() && guestbook.content.trim();

    return (
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-2xl p-6 sm:p-8 card-hover">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📝</span>
                <h3 className="text-lg font-semibold text-[#e8e6e3]">새 메시지 작성</h3>
            </div>

            <div className="space-y-4">
                {/* 닉네임 입력 */}
                <div>
                    <label htmlFor="nickname" className="block text-sm font-medium text-[#a0a0b0] mb-2">
                        닉네임
                    </label>
                    <input
                        type="text"
                        id="nickname"
                        name="nickname"
                        value={guestbook.nickname}
                        onChange={handleChange}
                        placeholder="이름을 입력하세요"
                        className="w-full px-4 py-3 bg-[#16213e] border border-[#2d2d44] rounded-xl 
                                   text-[#e8e6e3] placeholder-[#6a6a7a]
                                   focus:outline-none focus:border-[#ff6b9d] input-focus
                                   transition-colors duration-200"
                    />
                </div>

                {/* 내용 입력 */}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-[#a0a0b0] mb-2">
                        메시지
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={guestbook.content}
                        onChange={handleChange}
                        placeholder="방명록을 적어주세요..."
                        rows={4}
                        className="w-full px-4 py-3 bg-[#16213e] border border-[#2d2d44] rounded-xl 
                                   text-[#e8e6e3] placeholder-[#6a6a7a]
                                   focus:outline-none focus:border-[#ff6b9d] input-focus
                                   transition-colors duration-200 resize-none"
                    />
                </div>

                {/* 제출 버튼 */}
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white
                               transition-all duration-300 btn-glow
                               ${isFormValid && !isSubmitting
                            ? 'bg-gradient-to-r from-[#ff6b9d] to-[#c792ea] hover:opacity-90 cursor-pointer'
                            : 'bg-[#2d2d44] text-[#6a6a7a] cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            저장 중...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span>✨</span>
                            메시지 남기기
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}

export default AddGuestBook;
