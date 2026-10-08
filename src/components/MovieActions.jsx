import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { addToWishlist, getWishlist, removeFromWishlist } from '../api/backend';
// TODO ขั้นที่ 5 (Lab): import putVote for saving ratings.

// แถบปุ่มใต้ชื่อหนัง: ให้คะแนน 1 ถึง 10 และปุ่มเพิ่มเข้า wishlist (ต้อง login)
function MovieActions({ movieId }) {
  const { isLoggedIn, token } = useAuth();
  const [myScore, setMyScore] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!isLoggedIn || !token) {
      setInWishlist(false);
      setWishlistLoading(false);
      return () => { ignore = true; };
    }

    setWishlistLoading(true);
    setMessage(null);
    getWishlist(token)
      .then(data => {
        if (!ignore) setInWishlist(data.items.some(item => item.id === Number(movieId)));
      })
      .catch(err => {
        if (!ignore) setMessage(err.message);
      })
      .finally(() => {
        if (!ignore) setWishlistLoading(false);
      });

    return () => { ignore = true; };
  }, [isLoggedIn, movieId, token]);

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        <Link to="/login" className="text-emerald-600 hover:underline">เข้าสู่ระบบ</Link> เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
      </p>
    );
  }

  async function handleVote(score) {
    // TODO ขั้นที่ 5 (Lab): await putVote(movieId, score, token) ก่อน แล้วค่อย setMyScore ถ้าพลาดให้ setMessage(err.message)
    setMyScore(score);                             // ตอนนี้เปลี่ยนแค่บนจอ refresh แล้วหาย เพราะยังไม่ได้ส่งไป server
    setMessage('คะแนนยังอยู่แค่บนจอ ยังไม่ได้ส่งไป API (ขั้นที่ 5)');
  }

  async function handleWishlist() {
    setWishlistSaving(true);
    setMessage(null);
    try {
      if (inWishlist) {
        await removeFromWishlist(movieId, token);
      } else {
        await addToWishlist(movieId, token);
      }
      setInWishlist(!inWishlist);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setWishlistSaving(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-500">ให้คะแนน</span>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => handleVote(n)}
                  className={'h-8 w-8 rounded-lg border text-sm ' +
                    (myScore === n ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50')}>
            {n}
          </button>
        ))}
      </div>
      <button onClick={handleWishlist} disabled={wishlistLoading || wishlistSaving}
              aria-pressed={inWishlist}
              className={'rounded-lg border px-4 py-2 text-sm ' +
                (inWishlist ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50') +
                ((wishlistLoading || wishlistSaving) ? ' cursor-wait opacity-60' : '')}>
        {wishlistLoading ? 'กำลังโหลดรายการที่อยากดู…' :
          inWishlist ? '❤️ อยู่ในรายการที่อยากดูแล้ว' : '🤍 เพิ่มเข้ารายการที่อยากดู'}
      </button>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}

export default MovieActions;
