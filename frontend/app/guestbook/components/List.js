'use client'

export default function List({ guestbooks }) {
    if (guestbooks.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-[#6a6a7a] text-lg">아직 작성된 방명록이 없습니다</p>
                <p className="text-[#4a4a5a] text-sm mt-2">첫 번째 메시지를 남겨보세요!</p>
            </div>
        );
    }

    // 날짜 포맷 함수
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ul className="space-y-4">
            {guestbooks.map((g, index) => (
                <li
                    key={g.id}
                    className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5 card-hover animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="flex items-start gap-4">
                        {/* 아바타 */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#c792ea] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {g.nickname?.charAt(0)?.toUpperCase() || '?'}
                        </div>

                        {/* 콘텐츠 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-[#ff6b9d]">
                                    {g.nickname}
                                </span>
                                {g.createdAt && (
                                    <span className="text-xs text-[#6a6a7a]">
                                        {formatDate(g.createdAt)}
                                    </span>
                                )}
                            </div>
                            <p className="text-[#c8c6c3] leading-relaxed break-words">
                                {g.content}
                            </p>
                        </div>
                    </div>

                    {/* 하단 데코레이션 */}
                    <div className="mt-4 pt-3 border-t border-[#2d2d44] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#6a6a7a]">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#50fa7b]"></span>
                            메시지 #{g.id}
                        </div>
                        <div className="text-[#7ee8fa] text-sm">💌</div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
