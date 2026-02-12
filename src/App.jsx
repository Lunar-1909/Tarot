import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Moon, Sun, Heart, Briefcase, Search, ArrowLeft, RefreshCw, X, Star, ChevronRight, Wind, User, BookOpen, Plane, Home, ShieldAlert, DollarSign, Activity, Menu, Crown, Clock, Users, Zap, Wallet, Loader2, BookText } from 'lucide-react';

/* --- CẤU HÌNH & DỮ LIỆU TAROT --- */
const TOPIC_GROUPS = [
  {
    title: "Tình Cảm & Mối Quan Hệ",
    items: [
      { id: 'crush', name: 'Crush / Người thầm thích', type: 'love', icon: <Heart/> },
      { id: 'ambiguous', name: 'Mối quan hệ mập mờ', type: 'love', icon: <Wind/> },
      { id: 'thinking', name: 'Người ấy (đang nghĩ đến)', type: 'love', icon: <User/> },
      { id: 'ex', name: 'Người yêu cũ / MQH cũ', type: 'love', icon: <RefreshCw/> },
      { id: 'current', name: 'Người yêu hiện tại', type: 'love', icon: <Heart className="fill-current"/> },
      { id: 'future_love', name: 'Người yêu tương lai', type: 'love', icon: <Sparkles/> },
    ]
  },
  {
    title: "Sự Nghiệp & Học Tập",
    items: [
      { id: 'career', name: 'Sự nghiệp / Công việc', type: 'career', icon: <Briefcase/> },
      { id: 'study', name: 'Học tập / Thi cử', type: 'career', icon: <BookOpen/> },
      { id: 'finance', name: 'Tài chính', type: 'finance', icon: <DollarSign/> },
    ]
  },
  {
    title: "Đời Sống & Bản Thân",
    items: [
      { id: 'self', name: 'Định hướng bản thân', type: 'general', icon: <Star/> },
      { id: 'health', name: 'Sức khỏe', type: 'health', icon: <Activity/> },
      { id: 'conflict', name: 'Giải quyết vấn đề', type: 'general', icon: <ShieldAlert/> },
    ]
  }
];

const SPREAD_CONFIG = {
  love: { cards: 4, positions: ["Cảm xúc của bạn", "Cảm xúc của họ", "Thử thách / Rào cản", "Kết quả / Tương lai"] },
  career: { cards: 3, positions: ["Tình hình hiện tại", "Cơ hội & Thách thức", "Kết quả dự đoán"] },
  finance: { cards: 3, positions: ["Tình hình tài chính", "Lời khuyên", "Xu hướng sắp tới"] },
  health: { cards: 3, positions: ["Sức khỏe hiện tại", "Điều cần lưu ý", "Lời khuyên cải thiện"] },
  general: { cards: 3, positions: ["Vấn đề cốt lõi", "Lời khuyên vũ trụ", "Kết quả"] },
  daily: { cards: 1, positions: ["Thông điệp trong ngày"] },
  future: { cards: 3, positions: ["Sắp tới (Gần)", "Biến cố bất ngờ", "Kết quả (Xa)"] }
};

const SUITS = {
  wands: { id: 'wands', name: "Gậy", icon: "🪄", color: "text-orange-400", bg: "bg-orange-900/20" },
  cups: { id: 'cups', name: "Cốc", icon: "🏆", color: "text-blue-400", bg: "bg-blue-900/20" },
  swords: { id: 'swords', name: "Kiếm", icon: "⚔️", color: "text-slate-300", bg: "bg-slate-800/50" },
  pentacles: { id: 'pentacles', name: "Tiền", icon: "🪙", color: "text-emerald-400", bg: "bg-emerald-900/20" }
};
const RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
const RANKS_VN = ["Ách", "Hai", "Ba", "Bốn", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Tiểu Đồng", "Hiệp Sĩ", "Nữ Hoàng", "Vua"];
const MAJOR_DATA = [
  "The Fool:Chàng Khờ", "The Magician:Pháp Sư", "The High Priestess:Nữ Tư Tế", "The Empress:Nữ Hoàng", "The Emperor:Hoàng Đế", 
  "The Hierophant:Giáo Hoàng", "The Lovers:Tình Nhân", "The Chariot:Cỗ Xe", "Strength:Sức Mạnh", "The Hermit:Ẩn Sĩ", 
  "Wheel of Fortune:Số Phận", "Justice:Công Lý", "The Hanged Man:Người Treo Ngược", "Death:Cái Chết", "Temperance:Cân Bằng", 
  "The Devil:Ác Quỷ", "The Tower:Tòa Tháp", "The Star:Ngôi Sao", "The Moon:Mặt Trăng", "The Sun:Mặt Trời", 
  "Judgement:Phán Xét", "The World:Thế Giới"
];

// Sinh chính xác 78 lá bài
const createDeck = () => {
  let deck = [];
  MAJOR_DATA.forEach((str, i) => {
    const [en, vn] = str.split(':');
    deck.push({ id: `maj-${i}`, suit: 'major', type: 'major', nameVN: vn, nameEN: en, icon: '🔮', suitInfo: { color: 'text-purple-300', bg: 'bg-purple-900/20' } });
  });
  Object.keys(SUITS).forEach(suitKey => {
    RANKS.forEach((rank, i) => {
      deck.push({
        id: `min-${suitKey}-${i}`,
        suit: suitKey,
        type: 'minor',
        nameVN: `${RANKS_VN[i]} ${SUITS[suitKey].name}`,
        nameEN: `${rank} of ${suitKey.charAt(0).toUpperCase() + suitKey.slice(1)}`,
        icon: SUITS[suitKey].icon,
        suitInfo: SUITS[suitKey]
      });
    });
  });
  return deck;
};

const FULL_DECK = createDeck();

const getCardDictionary = (card) => {
  let xuoi = "";
  let nguoc = "";
  if (card.type === 'major') {
    xuoi = `Lá bài ${card.nameVN} đại diện cho những thay đổi lớn mang tính bước ngoặt, bài học định mệnh và sự thức tỉnh. Năng lượng đang trôi chảy tự nhiên, ủng hộ sự phát triển cá nhân của bạn.`;
    nguoc = `Năng lượng của ${card.nameVN} đang bị tắc nghẽn. Bạn có thể đang chối bỏ sự thật, thiếu tự tin, hoặc đi ngược dòng chảy tự nhiên. Lời khuyên là hãy chậm lại và nhìn nhận sâu vào bên trong.`;
  } else {
    const suitTraits = {
      wands: { x: 'hành động, đam mê, ý chí, và sự sáng tạo', n: 'sự nóng vội, thiếu động lực, kiệt sức hoặc mất phương hướng' },
      cups: { x: 'cảm xúc, tình yêu, trực giác, và các mối quan hệ', n: 'sự bất ổn tâm lý, ảo tưởng, rạn nứt tình cảm' },
      swords: { x: 'tư duy, lý trí, sự giao tiếp, và sự thật', n: 'sự căng thẳng, lời nói tổn thương, lo âu hoặc xung đột' },
      pentacles: { x: 'vật chất, công việc, sự ổn định thực tế', n: 'sự thất thoát tài chính, tham lam hoặc bất an về tiền bạc' }
    };
    const t = suitTraits[card.suit];
    xuoi = `Thuộc bộ ${card.suitInfo.name}, lá bài ${card.nameVN} nhấn mạnh vào ${t.x}. Mọi thứ liên quan đến khía cạnh này đang có chiều hướng tiến triển tích cực và rõ ràng.`;
    nguoc = `Lá bài cảnh báo bạn đang gặp rào cản về ${t.n}. Bạn cần cẩn trọng suy xét lại tình hình, tránh đưa ra quyết định vội vàng lúc này.`;
  }
  return { xuoi, nguoc };
};

const getMeaning = (card, position, isReversed) => {
  const direction = isReversed ? "Chiều Ngược" : "Chiều Xuôi";
  const dict = getCardDictionary(card);
  const baseDesc = isReversed ? dict.nguoc : dict.xuoi;
  return { title: `${card.nameVN} (${direction})`, desc: `Tại vị trí "${position}": ${baseDesc}` };
};

const TIERS = [
  { id: 'Free', name: 'Free', price: 'Miễn phí', color: 'from-slate-600 to-slate-800', features: ['Bói cơ bản', '3 Chủ đề'] },
  { id: 'Plus', name: 'Plus', price: '49.000đ', color: 'from-blue-600 to-indigo-600', features: ['Mở khóa 10 chủ đề', 'Lưu lịch sử 7 ngày'] },
  { id: 'Pro', name: 'Pro', price: '99.000đ', color: 'from-purple-600 to-pink-600', features: ['Tất cả chủ đề', 'Lưu lịch sử 30 ngày', 'Không quảng cáo'] },
  { id: 'Vip', name: 'VIP', price: '199.000đ', color: 'from-amber-500 to-orange-600', features: ['Full tính năng', 'Ưu tiên hỗ trợ', 'Huy hiệu VIP'] },
];

export default function BoiTarotOnline() {
  const [currentView, setCurrentView] = useState('home'); // home, library, readers, upgrade
  const [step, setStep] = useState('intro');
  const [userInfo, setUserInfo] = useState({ name: '', yob: '' });
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  const [deck, setDeck] = useState([]);
  const [pickedCards, setPickedCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);
  
  const [libFilter, setLibFilter] = useState('major');
  const [selectedLibCard, setSelectedLibCard] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userTier, setUserTier] = useState('Free');
  const [upgradeCode, setUpgradeCode] = useState('');
  const [bypassPayment, setBypassPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTierForPayment, setSelectedTierForPayment] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const scrollRef = useRef(null);

  const handleMenuClick = (view) => {
    setIsMenuOpen(false);
    
    if (view === 'daily') {
      setSelectedTopic({ id: 'daily', name: 'Bói Tarot Hôm Nay', type: 'daily' });
      setCurrentView('home');
      startShuffle();
    } else if (view === 'future') {
      setSelectedTopic({ id: 'future', name: 'Bói Tarot Tương Lai', type: 'future' });
      setCurrentView('home');
      startShuffle();
    } else {
      setCurrentView(view);
      if (view === 'home') {
        setSelectedTopic(null); // Reset chủ đề khi về Trang chủ
        setStep('topics');
      }
    }
  };

  const startShuffle = () => {
    setStep('shuffle');
    setTimeout(() => {
      const newDeck = createDeck()
        .map(c => ({ ...c, isReversed: Math.random() < 0.3, uid: Math.random() }))
        .sort((a, b) => a.uid - b.uid);
      setDeck(newDeck);
      setPickedCards([]);
      setRevealedCards([]);
      setStep('pick');
    }, 2500);
  };

  const handleInfoSubmit = () => { if (userInfo.name.trim()) setStep('topics'); };
  
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    startShuffle();
  };

  const handlePick = (card) => {
    const config = SPREAD_CONFIG[selectedTopic.type];
    if (pickedCards.length < config.cards && !pickedCards.find(c => c.uid === card.uid)) {
      const newPicked = [...pickedCards, card];
      setPickedCards(newPicked);
      if (newPicked.length === config.cards) setTimeout(() => setStep('reading'), 800);
    }
  };

  const handleReveal = (idx) => { if (!revealedCards.includes(idx)) setRevealedCards([...revealedCards, idx]); };
  const reset = () => { setStep('topics'); setPickedCards([]); setRevealedCards([]); };

  const handleUpgradeClick = (tier) => {
    if (bypassPayment) { setUserTier(tier.id); alert(`Đã kích hoạt gói ${tier.name} thành công!`); } 
    else { setSelectedTierForPayment(tier); setShowPaymentModal(true); }
  };

  const processPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false); setShowPaymentModal(false); setUserTier(selectedTierForPayment.id);
      alert("Thanh toán thành công!");
    }, 3000);
  };

  const checkCode = (e) => {
    const val = e.target.value; setUpgradeCode(val);
    if (val === '36thanhhoa') setBypassPayment(true); else setBypassPayment(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0c0a14] text-slate-100 font-sans flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a112e] via-[#0c0a14] to-black opacity-90 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 animate-pulse pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-40 h-16 flex items-center justify-between px-4 border-b border-white/5 bg-[#0c0a14]/95 backdrop-blur-md">
        {currentView === 'home' && step !== 'intro' && step !== 'info' ? (
           <button onClick={() => { if (step !== 'topics') { setStep('topics'); setSelectedTopic(null); } }} className="p-2 -ml-2 text-slate-400 hover:text-white">
             {step === 'topics' ? <div className="w-8"></div> : <ArrowLeft size={22}/>}
           </button>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-900 border border-white/10 flex items-center justify-center text-xs font-bold text-purple-200">
             {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={14}/>}
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <h1 className="font-serif font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-purple-200 to-amber-100 tracking-widest uppercase">
            BÓI TAROT ONLINE
          </h1>
        </div>

        <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2 text-slate-300 hover:text-white">
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* SIDEBAR MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-72 h-full bg-[#151221] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent">
              <div>
                 <h2 className="font-serif text-white text-lg">Menu</h2>
                 <p className="text-xs text-slate-500 mt-1">Hệ thống 78 lá bài chuẩn</p>
              </div>
              <button onClick={() => setIsMenuOpen(false)}><X size={20} className="text-slate-400"/></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {/* Đã sửa điều kiện bôi đen (highlight) */}
                <MenuButton 
                  active={currentView === 'home' && (!selectedTopic || !['daily', 'future'].includes(selectedTopic.type))} 
                  icon={<Home size={18}/>} label="Trang chủ (Mặc định)" onClick={() => handleMenuClick('home')} 
                />
                <MenuButton 
                  active={currentView === 'home' && selectedTopic?.type === 'daily'} 
                  icon={<Sun size={18}/>} label="Bói Tarot hôm nay" onClick={() => handleMenuClick('daily')} 
                />
                <MenuButton 
                  active={currentView === 'home' && selectedTopic?.type === 'future'} 
                  icon={<Sparkles size={18}/>} label="Bói Tarot tương lai" onClick={() => handleMenuClick('future')} 
                />
                <MenuButton 
                  active={currentView === 'library'} 
                  icon={<BookText size={18}/>} label="Ý nghĩa 78 lá bài" onClick={() => handleMenuClick('library')} 
                />
                <MenuButton 
                  active={currentView === 'readers'} 
                  icon={<Users size={18}/>} label="Các Tarot Reader" onClick={() => handleMenuClick('readers')} 
                />
                
                <div className="my-4 border-t border-white/5 mx-4"></div>
                <MenuButton active={currentView === 'upgrade'} icon={<Crown size={18} className={currentView === 'upgrade' ? 'text-amber-300' : 'text-amber-500'}/>} label="Nâng Cấp VIP" onClick={() => handleMenuClick('upgrade')} highlight />
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <>
            {step === 'intro' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-40 h-40 relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-amber-600 rounded-full blur-[40px] opacity-20 animate-pulse"></div>
                  <div className="relative w-full h-full border border-white/10 rounded-full flex items-center justify-center bg-[#1a1526]/50 shadow-2xl">
                    <Moon size={60} className="text-purple-200 animate-float" strokeWidth={1}/>
                  </div>
                </div>
                <h2 className="text-2xl font-serif text-white mb-3">BÓI TAROT ONLINE</h2>
                <button onClick={() => setStep('info')} className="mt-8 px-10 py-3 bg-white/10 border border-white/20 rounded-full text-sm font-bold tracking-widest uppercase transition-all">Bắt Đầu</button>
              </div>
            )}

            {step === 'info' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 animate-slide-up">
                <div className="w-full max-w-sm space-y-6 text-center">
                  <h3 className="text-lg font-serif text-white">Nhập thông tin</h3>
                  <input type="text" placeholder="Họ tên của bạn" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} className="w-full bg-[#1a1526] border border-white/10 p-4 rounded-lg text-white focus:outline-none text-center" />
                  <input type="number" placeholder="Năm sinh (Dương lịch)" value={userInfo.yob} onChange={e => setUserInfo({...userInfo, yob: e.target.value})} className="w-full bg-[#1a1526] border border-white/10 p-4 rounded-lg text-white focus:outline-none text-center" />
                  <button onClick={handleInfoSubmit} disabled={!userInfo.name} className={`w-full py-4 rounded-lg font-bold tracking-wider ${userInfo.name ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-500'}`}>XÁC NHẬN</button>
                </div>
              </div>
            )}

            {step === 'topics' && (
              <div className="flex-1 overflow-y-auto p-4 pb-20 animate-fade-in">
                <div className="mb-6 px-2 text-center">
                  <h3 className="text-xl font-serif text-white">Chủ đề quan tâm?</h3>
                </div>
                <div className="space-y-8">
                  {TOPIC_GROUPS.map((group, idx) => (
                    <div key={idx}>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 border-l-2 border-purple-500 pl-2">{group.title}</h4>
                      <div className="grid gap-2">
                        {group.items.map(topic => (
                          <button key={topic.id} onClick={() => handleTopicSelect(topic)} className="flex items-center gap-4 p-4 bg-[#151221] border border-white/5 rounded-xl hover:border-purple-500/30 transition-all">
                            <div className="w-10 h-10 rounded-full bg-[#1e1b2e] flex items-center justify-center text-slate-400">{topic.icon}</div>
                            <span className="flex-1 text-left text-sm font-medium text-slate-200">{topic.name}</span>
                            <ChevronRight size={16} className="text-slate-600"/>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'shuffle' && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in relative">
                <div className="relative w-40 h-60">
                   {[0,1,2].map(i => (
                     <div key={i} className="absolute inset-0 bg-gradient-to-br from-[#2d1b69] to-[#0f0a1e] rounded-xl border border-white/10 shadow-2xl animate-shuffle" style={{animationDelay: `${i*0.1}s`}}>
                       <div className="absolute inset-0 flex items-center justify-center"><Star className="text-white/10" size={24}/></div>
                     </div>
                   ))}
                </div>
                <p className="mt-12 text-sm font-serif text-purple-200 tracking-widest animate-pulse">ĐANG XÁO TRỘN...</p>
              </div>
            )}

            {step === 'pick' && (
              <div className="flex-1 flex flex-col animate-fade-in">
                <div className="px-6 py-6 text-center">
                  <h3 className="font-serif text-white text-lg">{selectedTopic.name}</h3>
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({length: SPREAD_CONFIG[selectedTopic.type].cards}).map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < pickedCards.length ? 'bg-purple-400 scale-125' : 'bg-slate-700'}`}></div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex items-center overflow-x-auto px-[40vw] hide-scrollbar pb-10" ref={scrollRef}>
                  <div className="flex" style={{ width: 'max-content' }}>
                    {deck.map((card) => {
                      const isPicked = pickedCards.find(c => c.uid === card.uid);
                      return (
                        <div key={card.uid} onClick={() => handlePick(card)} className={`relative w-24 h-40 -ml-12 first:ml-0 rounded-lg shadow-2xl cursor-pointer transition-all border border-white/10 flex-shrink-0 ${isPicked ? '-translate-y-20 z-20 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'bg-[#151221] hover:-translate-y-4 hover:z-10'}`}>
                          <div className="w-full h-full rounded-lg bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                          <div className="absolute inset-0 flex items-center justify-center"><Moon size={12} className="text-white/10"/></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 'reading' && (
              <div className="flex-1 overflow-y-auto px-4 py-8 pb-24 animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/20 text-[10px] uppercase tracking-widest text-purple-300 mb-2">Kết quả</div>
                  <h2 className="text-2xl font-serif text-white">{selectedTopic.name}</h2>
                </div>
                <div className="space-y-12">
                  {pickedCards.map((card, idx) => {
                    const isRevealed = revealedCards.includes(idx);
                    const posName = SPREAD_CONFIG[selectedTopic.type].positions[idx];
                    const meaning = getMeaning(card, posName, card.isReversed);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-4">Lá bài {idx + 1}: {posName}</div>
                        <div onClick={() => handleReveal(idx)} className="relative w-48 h-72 perspective-1000 cursor-pointer mb-6">
                           <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${isRevealed ? 'rotate-y-180' : ''}`}>
                             <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1e1b2e] to-black border border-white/10 rounded-xl flex items-center justify-center">
                               <Sparkles className="text-purple-500/20 w-12 h-12 animate-spin-slow"/>
                             </div>
                             <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-[#f0f0f0] rounded-xl overflow-hidden border-[6px] ${card.isReversed ? 'border-red-900' : 'border-[#2d2a3d]'}`}>
                               <div className={`h-full flex flex-col items-center justify-center relative ${card.isReversed ? 'rotate-180' : ''}`}>
                                 <div className="text-6xl animate-float pb-4">{card.icon}</div>
                                 <div className="absolute bottom-4 text-center w-full px-2">
                                    <h4 className="font-serif font-bold text-slate-800 uppercase text-xs leading-tight">{card.nameVN}</h4>
                                 </div>
                               </div>
                               {card.isReversed && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded rotate-y-180 uppercase">Ngược</div>}
                             </div>
                           </div>
                        </div>
                        <div className={`w-full bg-[#151221] border border-white/5 rounded-lg p-5 transition-all duration-500 ${isRevealed ? 'opacity-100' : 'opacity-0 hidden'}`}>
                          <h4 className={`font-serif text-sm mb-2 font-bold ${card.isReversed ? 'text-red-400' : 'text-emerald-400'}`}>{meaning.title}</h4>
                          <p className="text-sm text-slate-300 font-light leading-relaxed">{meaning.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-12 flex justify-center">
                   <button onClick={reset} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-medium">Xem quẻ khác</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW: LIBRARY (Ý NGHĨA 78 LÁ BÀI) */}
        {currentView === 'library' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in bg-[#0c0a14]">
             <div className="p-4 pt-6 text-center border-b border-white/5 bg-[#151221]">
                <h2 className="text-xl font-serif text-white">Thư Viện Tarot</h2>
             </div>
             
             <div className="flex overflow-x-auto p-3 gap-2 hide-scrollbar border-b border-white/5 bg-[#1a1526]/50">
               <button onClick={()=>setLibFilter('major')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${libFilter === 'major' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}>Ẩn Chính (22)</button>
               <button onClick={()=>setLibFilter('wands')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${libFilter === 'wands' ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400'}`}>Bộ Gậy</button>
               <button onClick={()=>setLibFilter('cups')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${libFilter === 'cups' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>Bộ Cốc</button>
               <button onClick={()=>setLibFilter('swords')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${libFilter === 'swords' ? 'bg-slate-600 text-white' : 'bg-white/5 text-slate-400'}`}>Bộ Kiếm</button>
               <button onClick={()=>setLibFilter('pentacles')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${libFilter === 'pentacles' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400'}`}>Bộ Tiền</button>
             </div>

             {/* Đã sửa Grid: Loại bỏ thuộc tính tự co dãn gây lỗi đè chồng chéo */}
             <div className="flex-1 overflow-y-auto w-full p-4 pb-24">
               <div className="grid grid-cols-3 gap-3 auto-rows-max">
                  {FULL_DECK.filter(c => c.suit === libFilter).map(card => (
                     <div key={card.id} onClick={()=>setSelectedLibCard(card)} 
                          className="h-36 bg-[#151221] border border-white/10 rounded-xl p-2 flex flex-col items-center justify-between cursor-pointer hover:border-purple-500 hover:bg-[#1a1625] transition-all relative overflow-hidden group">
                       <div className={`absolute inset-0 ${card.suitInfo.bg} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                       
                       {/* Nửa trên (Fix cứng chiều cao 50% để không đè) */}
                       <div className="h-1/2 w-full flex items-end justify-center pb-1 relative z-10">
                          <div className="text-4xl filter drop-shadow-md">{card.icon}</div>
                       </div>
                       
                       {/* Nửa dưới chứa tên */}
                       <div className="h-1/2 w-full flex items-start justify-center pt-2 relative z-10 px-1">
                          <h4 className={`text-[11px] font-bold text-center leading-tight w-full line-clamp-2 ${card.suitInfo.color}`}>{card.nameVN}</h4>
                       </div>
                     </div>
                  ))}
               </div>
             </div>

             {/* Popup chi tiết ý nghĩa */}
             {selectedLibCard && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={()=>setSelectedLibCard(null)}></div>
                  <div className="relative bg-[#151221] w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-up">
                     <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#1a1625]">
                        <div>
                          <h3 className={`font-serif font-bold text-lg ${selectedLibCard.suitInfo.color}`}>{selectedLibCard.nameVN}</h3>
                        </div>
                        <button onClick={()=>setSelectedLibCard(null)} className="p-2 bg-white/5 rounded-full text-slate-400"><X size={16}/></button>
                     </div>
                     <div className="overflow-y-auto p-5 space-y-6">
                        <div>
                           <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>Ý Nghĩa Xuôi</h4>
                           <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">{getCardDictionary(selectedLibCard).xuoi}</p>
                        </div>
                        <div>
                           <h4 className="flex items-center gap-2 text-sm font-bold text-red-400 mb-2"><div className="w-2 h-2 rounded-full bg-red-400"></div>Ý Nghĩa Ngược</h4>
                           <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">{getCardDictionary(selectedLibCard).nguoc}</p>
                        </div>
                     </div>
                  </div>
                </div>
             )}
          </div>
        )}

      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes slide-in-right { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        @keyframes scale-up { from{transform:scale(0.9);opacity:0} to{transform:scale(1);opacity:1} }
        .animate-scale-up { animation: scale-up 0.3s ease-out; }
        @keyframes shuffle { 0%,100%{transform:translate(0,0) rotate(0)} 25%{transform:translate(-10px,0) rotate(-3deg)} 50%{transform:translate(10px,0) rotate(3deg)} 75%{transform:translate(0,-5px) rotate(0)} }
        .animate-shuffle { animation: shuffle 0.5s infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}

const MenuButton = ({ icon, label, onClick, active, highlight }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all mb-1
      ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
      ${highlight ? 'border border-amber-500/20 bg-amber-500/5' : ''}
    `}
  >
    <div className={`${active || highlight ? 'text-opacity-100' : 'text-opacity-70'} ${highlight ? 'text-amber-400' : ''}`}>{icon}</div>
    <span className={`text-sm font-medium ${highlight ? 'text-amber-200' : ''}`}>{label}</span>
  </button>
);