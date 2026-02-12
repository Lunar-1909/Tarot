import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Moon, Sun, Heart, Briefcase, Search, ArrowLeft, RefreshCw, X, Star, ChevronRight, Wind, User, BookOpen, Plane, Home, ShieldAlert, DollarSign, Activity, Menu, Crown, Clock, Users, Zap, Wallet, Loader2, BookText, Share2, Volume2, VolumeX } from 'lucide-react';

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
  { id: 'Free', name: 'Cơ bản', price: 'Miễn phí', color: 'from-slate-600 to-slate-800', features: ['Bói cơ bản', '3 Chủ đề'] },
  { id: 'Plus', name: 'Plus', price: '49.000đ', color: 'from-blue-600 to-indigo-600', features: ['Mở khóa 10 chủ đề', 'Lưu lịch sử 7 ngày'] },
  { id: 'Pro', name: 'Pro', price: '99.000đ', color: 'from-purple-600 to-pink-600', features: ['Tất cả chủ đề', 'Lưu lịch sử 30 ngày', 'Không quảng cáo'] },
  { id: 'Premium', name: 'Premium', price: '199.000đ', color: 'from-amber-500 to-orange-600', features: ['Full tính năng', 'Ưu tiên hỗ trợ', 'Huy hiệu đặc quyền'] },
];

export default function BoiTarotOnline() {
  const [currentView, setCurrentView] = useState('home'); 
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

  const [soundEnabled, setSoundEnabled] = useState(false);

  // Ref chỉ dành cho vùng Bốc bài (vuốt ngang)
  const cardsScrollRef = useRef(null);
  
  // Custom Hook hoặc UseEffect để gán Wheel Event (chỉ áp dụng cho vùng cuộn ngang)
  useEffect(() => {
    const handleWheel = (e) => {
      // Bỏ qua nếu đang lăn chuột trên Trackpad (deltaX có giá trị)
      if (Math.abs(e.deltaX) > 0) return;
      
      const container = e.currentTarget;
      // Chỉ cuộn ngang khi vùng chứa có thể cuộn ngang
      if (container.scrollWidth > container.clientWidth) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    const attachWheel = (ref) => {
      if (ref.current) {
        ref.current.addEventListener('wheel', handleWheel, { passive: false });
      }
    };

    const detachWheel = (ref) => {
      if (ref.current) {
        ref.current.removeEventListener('wheel', handleWheel);
      }
    };

    // Chỉ áp dụng cho phần chọn bài
    attachWheel(cardsScrollRef);

    return () => {
      detachWheel(cardsScrollRef);
    };
  }, [step, currentView]); 

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
        setSelectedTopic(null);
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
      
      setStep((currentStep) => {
        if (currentStep === 'shuffle') return 'pick';
        return currentStep;
      });
    }, 2500);
  };

  const handleInfoSubmit = () => { if (userInfo.name.trim()) setStep('topics'); };
  
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    startShuffle();
  };

  const handlePick = (card) => {
    if (!selectedTopic) return;
    const config = SPREAD_CONFIG[selectedTopic.type];
    if (pickedCards.length < config.cards && !pickedCards.find(c => c.uid === card.uid)) {
      const newPicked = [...pickedCards, card];
      setPickedCards(newPicked);
      if (newPicked.length === config.cards) setTimeout(() => setStep('reading'), 800);
    }
  };

  const handleReveal = (idx) => { if (!revealedCards.includes(idx)) setRevealedCards([...revealedCards, idx]); };
  const reset = () => { setStep('topics'); setSelectedTopic(null); setPickedCards([]); setRevealedCards([]); };

  const handleUpgradeClick = (tier) => {
    if (bypassPayment) { 
        setUserTier(tier.id); 
        alert(`Đã kích hoạt gói ${tier.name} thành công!`); 
    } else { 
        setSelectedTierForPayment(tier); 
        setShowPaymentModal(true); 
    }
  };

  const processPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false); 
      setShowPaymentModal(false); 
      setUserTier(selectedTierForPayment.id);
      alert("Thanh toán thành công! Tài khoản của bạn đã được nâng cấp.");
    }, 3000);
  };

  const checkCode = (e) => {
    const val = e.target.value; setUpgradeCode(val);
    if (val === '36thanhhoa') setBypassPayment(true); else setBypassPayment(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0c0a14] text-slate-100 font-sans flex flex-col overflow-hidden selection:bg-purple-500/30">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a112e] via-[#0c0a14] to-black opacity-90 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 animate-pulse pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-40 h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-[#0c0a14]/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          {currentView === 'home' && step !== 'intro' && step !== 'info' ? (
             <button onClick={() => { 
               if (step !== 'topics') { 
                 setStep('topics'); 
                 setSelectedTopic(null); 
                 setPickedCards([]);
               } 
             }} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
               {step === 'topics' ? <div className="w-6"></div> : <ArrowLeft size={22}/>}
             </button>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-900 border border-white/10 flex items-center justify-center text-sm font-bold text-purple-200 shadow-inner">
               {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={16}/>}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center">
          <h1 className="font-serif font-bold text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-purple-200 to-amber-100 tracking-widest uppercase cursor-pointer" onClick={() => handleMenuClick('home')}>
            BÓI TAROT ONLINE
          </h1>
          {userTier !== 'Free' && <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 uppercase tracking-widest mt-0.5">Tài Khoản {userTier}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="hidden md:flex p-2 text-slate-400 hover:text-purple-300 hover:bg-white/5 rounded-full transition-colors">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-colors">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* SIDEBAR MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-72 h-full bg-[#151221] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent">
              <div>
                 <h2 className="font-serif text-white text-lg">Khám Phá</h2>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-slate-400"/></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
              <nav className="space-y-1 px-3">
                <MenuButton active={currentView === 'home' && (!selectedTopic || !['daily', 'future'].includes(selectedTopic.type))} icon={<Home size={18}/>} label="Trang chủ" onClick={() => handleMenuClick('home')} />
                <MenuButton active={currentView === 'home' && selectedTopic?.type === 'daily'} icon={<Sun size={18}/>} label="Bói Tarot hôm nay" onClick={() => handleMenuClick('daily')} />
                <MenuButton active={currentView === 'home' && selectedTopic?.type === 'future'} icon={<Sparkles size={18}/>} label="Bói Tarot tương lai" onClick={() => handleMenuClick('future')} />
                <MenuButton active={currentView === 'library'} icon={<BookText size={18}/>} label="Ý nghĩa 78 lá bài" onClick={() => handleMenuClick('library')} />
                <MenuButton active={currentView === 'readers'} icon={<Users size={18}/>} label="Các Tarot Reader" onClick={() => handleMenuClick('readers')} />
                
                <div className="md:hidden">
                  <MenuButton 
                    active={soundEnabled} 
                    icon={soundEnabled ? <Volume2 size={18}/> : <VolumeX size={18}/>} 
                    label={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"} 
                    onClick={() => setSoundEnabled(!soundEnabled)} 
                  />
                </div>

                <div className="my-4 border-t border-white/5 mx-4"></div>
                <MenuButton active={currentView === 'upgrade'} icon={<Crown size={18} className={currentView === 'upgrade' ? 'text-amber-300' : 'text-amber-500'}/>} label="Nâng Cấp Tài Khoản" onClick={() => handleMenuClick('upgrade')} highlight />
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
          {/* VIEW: HOME */}
          {currentView === 'home' && (
            <>
              {step === 'intro' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
                  
                  {/* TRANG TRÍ RIÊNG CHO MÀN HÌNH MÁY TÍNH (PC) */}
                  <div className="absolute inset-0 pointer-events-none hidden md:block z-0">
                     <div className="absolute top-[20%] left-[15%] w-32 h-48 bg-gradient-to-br from-indigo-900/30 to-[#0c0a14] border border-white/5 rounded-xl transform -rotate-12 animate-float blur-[1px]"></div>
                     <div className="absolute bottom-[20%] left-[25%] w-24 h-36 bg-gradient-to-br from-purple-900/20 to-[#0c0a14] border border-white/5 rounded-xl transform -rotate-6 animate-float" style={{animationDelay: '1s'}}></div>
                     
                     <div className="absolute top-[30%] right-[15%] w-32 h-48 bg-gradient-to-br from-amber-900/20 to-[#0c0a14] border border-white/5 rounded-xl transform rotate-12 animate-float blur-[1px]" style={{animationDelay: '0.5s'}}></div>
                     <div className="absolute bottom-[15%] right-[25%] w-40 h-60 bg-gradient-to-br from-slate-800/30 to-[#0c0a14] border border-white/5 rounded-xl transform rotate-6 animate-float" style={{animationDelay: '1.5s'}}></div>
                     
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-spin-slow opacity-20"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-dashed border-white/5 rounded-full animate-spin-slow-reverse opacity-20"></div>
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-40 h-40 md:w-56 md:h-56 relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-amber-600 rounded-full blur-[50px] opacity-30 animate-pulse"></div>
                      <div className="relative w-full h-full border border-white/10 rounded-full flex items-center justify-center bg-[#1a1526]/50 shadow-2xl backdrop-blur-md">
                        <Moon className="text-purple-200 animate-float w-16 h-16 md:w-24 md:h-24" strokeWidth={1}/>
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-4 tracking-wide text-shadow-glow">BÓI TAROT ONLINE</h2>
                    <p className="text-slate-400 mb-10 max-w-md mx-auto md:text-lg">Khám phá thông điệp vũ trụ dành riêng cho bạn thông qua 78 lá bài huyền bí.</p>
                    
                    {/* NÚT BẮT ĐẦU VỚI NỀN TRONG SUỐT VÀ HIỆU ỨNG NEON */}
                    <button 
                      onClick={() => setStep('info')} 
                      className="px-12 py-4 md:py-5 bg-transparent border-2 border-purple-500/50 rounded-full text-purple-200 text-sm md:text-base font-bold tracking-widest uppercase hover:bg-purple-600/20 hover:border-purple-400 hover:text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                    >
                      Nhận Thông Điệp
                    </button>
                  </div>
                </div>
              )}

              {step === 'info' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 animate-slide-up">
                  <div className="w-full max-w-md space-y-6 text-center bg-[#151221] p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl relative z-10">
                    <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-400"><User size={32}/></div>
                    <h3 className="text-xl md:text-2xl font-serif text-white">Kết nối năng lượng</h3>
                    <p className="text-sm text-slate-400 mb-6">Nhập tên của bạn để bài Tarot kết nối chính xác với trường năng lượng của bạn.</p>
                    
                    <input type="text" placeholder="Họ tên của bạn" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors text-center text-lg" />
                    <input type="number" placeholder="Năm sinh (Tùy chọn)" value={userInfo.yob} onChange={e => setUserInfo({...userInfo, yob: e.target.value})} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors text-center text-lg mt-4" />
                    
                    <button onClick={handleInfoSubmit} disabled={!userInfo.name} className={`w-full py-4 mt-8 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 ${userInfo.name ? 'bg-purple-600 text-white hover:bg-purple-500 hover:shadow-lg shadow-purple-900/50' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Xác Nhận</button>
                  </div>
                </div>
              )}

              {/* LƯỚT DỌC CHO TOPICS: Trả lại dạng Grid lướt từ trên xuống */}
              {step === 'topics' && (
                <div className="flex-1 overflow-y-auto pb-20 md:pb-12 animate-fade-in custom-scrollbar">
                  <div className="mb-8 md:mb-12 text-center mt-8 px-4">
                    <h3 className="text-2xl md:text-4xl font-serif text-white">Chào {userInfo.name},</h3>
                    <p className="text-slate-400 mt-3 md:text-lg">Bạn đang tìm kiếm lời khuyên về vấn đề gì?</p>
                  </div>
                  
                  <div className="w-full space-y-10 md:space-y-14">
                    {TOPIC_GROUPS.map((group, idx) => (
                      <div key={idx} className="w-full">
                        <div className="px-6 md:px-12 xl:px-24 mb-6">
                          <h4 className="text-sm md:text-base font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <Star size={16} className="text-purple-500"/> {group.title}
                          </h4>
                        </div>
                        
                        {/* HÀNG LƯỚT DỌC THEO GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-6 md:px-12 xl:px-24">
                          {group.items.map(topic => (
                            <button key={topic.id} onClick={() => handleTopicSelect(topic)} className="w-full flex flex-col p-5 md:p-6 bg-[#1a1625] border border-white/5 rounded-2xl hover:border-purple-500/50 hover:bg-[#1f1a2e] hover:-translate-y-1 transition-all duration-300 group text-left shadow-lg">
                              <div className="w-12 h-12 md:w-14 md:h-14 mb-4 rounded-full bg-black/50 flex items-center justify-center text-slate-400 group-hover:text-purple-400 group-hover:scale-110 transition-transform shadow-inner">{topic.icon}</div>
                              <span className="text-base md:text-lg font-medium text-slate-200 mb-2">{topic.name}</span>
                              <span className="text-xs md:text-sm text-slate-500 mt-auto flex items-center gap-1 group-hover:text-purple-400 transition-colors">Chọn để rút {SPREAD_CONFIG[topic.type].cards} lá <ChevronRight size={14}/></span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 'shuffle' && (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in relative z-10">
                  <div className="relative w-48 h-72 md:w-56 md:h-80">
                     {[0,1,2].map(i => (
                       <div key={i} className="absolute inset-0 bg-gradient-to-br from-[#2d1b69] to-[#0f0a1e] rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] animate-shuffle" style={{animationDelay: `${i*0.1}s`}}>
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                         <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="text-purple-400/50 w-12 h-12" strokeWidth={1}/></div>
                       </div>
                     ))}
                  </div>
                  <p className="mt-16 text-base md:text-lg font-serif text-purple-300 tracking-widest animate-pulse flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin"/> ĐANG KẾT NỐI NĂNG LƯỢNG...
                  </p>
                </div>
              )}

              {/* BỐC THẺ: Lướt ngang (Kèm lăn chuột trên PC) */}
              {step === 'pick' && selectedTopic && (
                <div className="flex-1 flex flex-col animate-fade-in h-full relative z-10">
                  <div className="px-6 py-6 md:py-8 text-center bg-gradient-to-b from-[#0c0a14] via-[#0c0a14]/90 to-transparent z-10 shrink-0">
                    <h3 className="font-serif text-white text-xl md:text-3xl">{selectedTopic.name}</h3>
                    <p className="text-slate-400 mt-2 text-sm md:text-base">Hãy hít thở sâu và chọn {SPREAD_CONFIG[selectedTopic.type].cards} lá bài</p>
                    <div className="flex justify-center gap-3 mt-6">
                      {Array.from({length: SPREAD_CONFIG[selectedTopic.type].cards}).map((_, i) => (
                        <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 ${i < pickedCards.length ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] scale-110' : 'bg-slate-800 border border-white/10'}`}></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Container lướt ngang để chọn bài */}
                  <div 
                    ref={cardsScrollRef}
                    className="flex-1 flex items-center overflow-x-auto px-10 md:px-24 custom-scrollbar pb-10 cursor-grab active:cursor-grabbing snap-x" 
                  >
                    <div className="flex py-10 items-center min-w-max">
                      {deck.map((card, index) => {
                        const isPicked = pickedCards.find(c => c.uid === card.uid);
                        return (
                          <div key={card.uid} onClick={() => handlePick(card)} className={`relative w-24 h-40 md:w-32 md:h-52 -ml-12 md:-ml-16 first:ml-0 rounded-xl shadow-2xl cursor-pointer transition-all duration-300 border border-white/10 flex-shrink-0 group snap-center ${isPicked ? '-translate-y-24 md:-translate-y-32 z-20 border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.5)]' : 'bg-[#151221] hover:-translate-y-6 md:hover:-translate-y-10 hover:z-10 hover:border-purple-500/50'}`}>
                            <div className="w-full h-full rounded-xl bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                            <div className="absolute inset-0 flex items-center justify-center group-hover:scale-125 transition-transform"><Moon size={16} className="text-white/20 group-hover:text-purple-400/50"/></div>
                          </div>
                        )
                      })}
                      <div className="w-24 md:w-32 shrink-0"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ĐỌC BÀI: Trả về lướt dọc (Vertical scroll) */}
              {step === 'reading' && selectedTopic && (
                <div className="flex-1 flex flex-col overflow-hidden animate-fade-in relative z-10">
                  <div className="text-center pt-8 pb-4 shrink-0 px-4 border-b border-white/5 bg-[#0c0a14]/90 backdrop-blur z-20 shadow-lg">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/20 text-xs md:text-sm uppercase tracking-widest text-purple-300 mb-4 flex items-center justify-center gap-2 w-max mx-auto"><Sparkles size={14}/> Kết quả trải bài</div>
                    <h2 className="text-2xl md:text-4xl font-serif text-white">{selectedTopic.name}</h2>
                  </div>
                  
                  {/* Container lướt DỌC cho kết quả đọc bài */}
                  <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-24">
                    <div className="flex flex-col items-center gap-16 md:gap-24 px-6 md:px-12 py-10 max-w-5xl mx-auto">
                      {pickedCards.map((card, idx) => {
                        const isRevealed = revealedCards.includes(idx);
                        const posName = SPREAD_CONFIG[selectedTopic.type].positions[idx];
                        const meaning = getMeaning(card, posName, card.isReversed);
                        
                        return (
                          <div key={idx} className="w-full flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
                            
                            {/* KHỐI LÁ BÀI */}
                            <div className="flex flex-col items-center shrink-0">
                              <div className="text-sm md:text-base font-bold text-amber-400/80 uppercase tracking-widest mb-6 flex flex-col items-center text-center">
                                <span className="text-xs text-slate-500 mb-1">Vị trí {idx + 1}</span>
                                {posName}
                              </div>
                              
                              <div onClick={() => handleReveal(idx)} className="relative w-56 h-80 md:w-64 md:h-96 perspective-1000 cursor-pointer group shrink-0">
                                 <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${isRevealed ? 'rotate-y-180' : 'group-hover:scale-105'}`}>
                                   
                                   {/* Mặt sau */}
                                   <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1e1b2e] to-black border border-purple-500/30 rounded-2xl flex items-center justify-center shadow-2xl">
                                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                                     <Sparkles className="text-purple-400 w-16 h-16 animate-pulse"/>
                                     <div className="absolute bottom-6 text-sm text-slate-500 tracking-widest uppercase">Chạm để mở</div>
                                   </div>
                                   
                                   {/* Mặt trước */}
                                   <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-[#f0f0f0] rounded-2xl overflow-hidden shadow-2xl ${card.isReversed ? 'border-b-[12px] border-red-800' : 'border-b-[12px] border-slate-800'}`}>
                                     <div className="absolute inset-3 border-2 border-slate-300 rounded-lg pointer-events-none"></div>
                                     <div className={`h-full flex flex-col items-center justify-center relative ${card.isReversed ? 'rotate-180' : ''}`}>
                                       <div className="text-8xl md:text-9xl animate-float pb-6 filter drop-shadow-lg">{card.icon}</div>
                                       <div className="absolute bottom-8 text-center w-full px-4">
                                          <h4 className="font-serif font-bold text-slate-900 uppercase text-base md:text-lg leading-tight bg-white/90 py-1.5 px-2 rounded shadow-sm">{card.nameVN}</h4>
                                       </div>
                                     </div>
                                     {card.isReversed && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600/90 backdrop-blur-sm text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full rotate-y-180 uppercase tracking-widest shadow-lg border border-red-400">Đảo Ngược</div>}
                                   </div>
                                 </div>
                              </div>
                            </div>

                            {/* KHỐI GIẢI NGHĨA */}
                            <div className={`w-full md:flex-1 md:mt-12 transition-all duration-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none hidden md:block md:invisible'}`}>
                              <h4 className={`font-serif text-xl md:text-2xl mb-4 font-bold text-center md:text-left ${card.isReversed ? 'text-red-400' : 'text-emerald-400'}`}>{meaning.title}</h4>
                              <div className="bg-[#151221]/80 backdrop-blur p-6 md:p-8 rounded-2xl border border-white/10 shadow-lg">
                                 <p className="text-base md:text-lg text-slate-300 font-light leading-relaxed text-justify">{meaning.desc}</p>
                              </div>
                            </div>

                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Nút thao tác ở dưới cùng */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0c0a14] via-[#0c0a14]/90 to-transparent flex justify-center gap-4 items-center z-20">
                     <button className="hidden sm:flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm md:text-base font-bold transition-all backdrop-blur-md"><Share2 size={18}/> Chia sẻ kết quả</button>
                     <button onClick={reset} className="w-full sm:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 rounded-xl text-white text-sm md:text-base font-bold transition-all">Xem quẻ khác</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* VIEW: LIBRARY */}
          {currentView === 'library' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in bg-[#0c0a14]">
               <div className="p-4 md:p-8 text-center border-b border-white/5 bg-[#151221] shrink-0">
                  <h2 className="text-xl md:text-4xl font-serif text-white">Thư Viện Cẩm Nang Tarot</h2>
                  <p className="text-slate-400 text-sm md:text-base mt-2 hidden md:block">Tra cứu ý nghĩa 78 lá bài chuẩn quốc tế</p>
               </div>
               
               <div className="flex overflow-x-auto p-4 gap-3 md:gap-4 md:justify-center custom-scrollbar border-b border-white/5 bg-[#1a1526]/50 shrink-0">
                 <button onClick={()=>setLibFilter('major')} className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${libFilter === 'major' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>🔮 Bộ Ẩn Chính (22)</button>
                 <button onClick={()=>setLibFilter('wands')} className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${libFilter === 'wands' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>🪄 Bộ Gậy (14)</button>
                 <button onClick={()=>setLibFilter('cups')} className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${libFilter === 'cups' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>🏆 Bộ Cốc (14)</button>
                 <button onClick={()=>setLibFilter('swords')} className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${libFilter === 'swords' ? 'bg-slate-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>⚔️ Bộ Kiếm (14)</button>
                 <button onClick={()=>setLibFilter('pentacles')} className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${libFilter === 'pentacles' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>🪙 Bộ Tiền (14)</button>
               </div>

               <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 pb-24 custom-scrollbar">
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4 max-w-[1600px] mx-auto">
                    {FULL_DECK.filter(c => c.suit === libFilter).map(card => (
                       <div key={card.id} onClick={()=>setSelectedLibCard(card)} 
                            className="h-40 md:h-48 bg-[#151221] border border-white/10 rounded-xl p-2 md:p-3 flex flex-col items-center justify-between cursor-pointer hover:-translate-y-2 hover:border-purple-500 hover:shadow-[0_10px_20px_rgba(168,85,247,0.2)] transition-all relative overflow-hidden group">
                         <div className={`absolute inset-0 ${card.suitInfo.bg} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                         <div className="h-1/2 w-full flex items-end justify-center pb-1 relative z-10"><div className="text-4xl md:text-5xl filter drop-shadow-md group-hover:scale-110 transition-transform">{card.icon}</div></div>
                         <div className="h-1/2 w-full flex items-start justify-center pt-2 md:pt-4 relative z-10 px-1"><h4 className={`text-[11px] md:text-xs font-bold text-center leading-tight w-full line-clamp-2 ${card.suitInfo.color}`}>{card.nameVN}</h4></div>
                       </div>
                    ))}
                 </div>
               </div>

               {/* Popup chi tiết ý nghĩa */}
               {selectedLibCard && (
                  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={()=>setSelectedLibCard(null)}></div>
                    <div className="relative bg-[#151221] w-full max-w-lg md:max-w-2xl rounded-2xl border border-white/10 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-up">
                       <div className="flex justify-between items-center p-5 md:p-6 border-b border-white/5 bg-[#1a1625]">
                          <div className="flex items-center gap-4">
                            <span className="text-4xl md:text-5xl">{selectedLibCard.icon}</span>
                            <div>
                              <h3 className={`font-serif font-bold text-xl md:text-3xl ${selectedLibCard.suitInfo.color}`}>{selectedLibCard.nameVN}</h3>
                              <p className="text-sm md:text-base text-slate-500 font-mono">{selectedLibCard.nameEN}</p>
                            </div>
                          </div>
                          <button onClick={()=>setSelectedLibCard(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
                       </div>
                       <div className="overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
                          <div>
                             <h4 className="flex items-center gap-2 text-base md:text-lg font-bold text-emerald-400 mb-3 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Ý Nghĩa Xuôi</h4>
                             <p className="text-base md:text-lg text-slate-300 leading-relaxed bg-emerald-900/10 p-5 md:p-6 rounded-xl border border-emerald-500/20">{getCardDictionary(selectedLibCard).xuoi}</p>
                          </div>
                          <div>
                             <h4 className="flex items-center gap-2 text-base md:text-lg font-bold text-red-400 mb-3 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-red-400"></div> Ý Nghĩa Ngược</h4>
                             <p className="text-base md:text-lg text-slate-300 leading-relaxed bg-red-900/10 p-5 md:p-6 rounded-xl border border-red-500/20">{getCardDictionary(selectedLibCard).nguoc}</p>
                          </div>
                       </div>
                    </div>
                  </div>
               )}
            </div>
          )}

          {currentView === 'upgrade' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-12 animate-fade-in pb-20 custom-scrollbar">
              <div className="text-center mb-10 md:mb-16 mt-4 md:mt-8">
                <Crown className="w-16 h-16 md:w-24 md:h-24 text-amber-400 mx-auto mb-6 animate-bounce filter drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Nâng Cấp Tài Khoản</h2>
                <p className="text-base md:text-xl text-slate-400">Trải nghiệm tâm linh không giới hạn</p>
              </div>

              <div className="mb-12 p-6 md:p-8 bg-[#1a1625] rounded-3xl border border-dashed border-white/20 max-w-2xl mx-auto shadow-xl">
                <label className="text-sm md:text-base text-slate-400 uppercase tracking-widest block mb-4 font-bold">Mã giới thiệu (Nếu có)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" placeholder="Nhập mã ưu đãi..." value={upgradeCode} onChange={checkCode}
                    className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 text-base md:text-lg"
                  />
                  <div className={`px-6 py-2 rounded-2xl flex items-center justify-center w-16 md:w-20 transition-colors ${bypassPayment ? 'bg-green-600 shadow-lg shadow-green-900/50' : 'bg-slate-800'}`}>
                    {bypassPayment ? <Zap size={24} className="text-white"/> : <X size={24} className="text-slate-500"/>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 max-w-[1400px] mx-auto px-4">
                {TIERS.map((tier) => (
                  <div key={tier.id} className={`relative p-8 md:p-10 rounded-3xl border ${userTier === tier.id ? 'border-amber-500 bg-[#1e1b2e] shadow-[0_0_40px_rgba(245,158,11,0.15)] scale-105 z-10' : 'border-white/10 bg-[#151221] hover:border-white/20'} overflow-hidden transition-all flex flex-col`}>
                    {userTier === tier.id && <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] md:text-sm font-bold px-4 py-2 rounded-bl-xl uppercase tracking-widest">Đang dùng</div>}
                    <div className="flex flex-col mb-8">
                       <h3 className={`text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${tier.color}`}>{tier.name}</h3>
                       <div className="text-2xl md:text-3xl text-white font-medium mt-3">{bypassPayment && tier.id !== 'Free' ? <span className="line-through text-slate-500 mr-2 text-xl">{tier.price}</span> : tier.price}</div>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                      {tier.features.map((ft, i) => (
                        <li key={i} className="text-base md:text-lg text-slate-300 flex items-center gap-3"><div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tier.color}`}></div> {ft}</li>
                      ))}
                    </ul>
                    <button 
                      disabled={userTier === tier.id || (tier.id === 'Free' && !bypassPayment)}
                      onClick={() => handleUpgradeClick(tier)}
                      className={`w-full py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg uppercase tracking-wide transition-all mt-auto
                        ${userTier === tier.id ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg shadow-orange-900/30 hover:-translate-y-1'}
                      `}
                    >
                      {userTier === tier.id ? 'Gói Hiện Tại' : 'Nâng Cấp Ngay'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'readers' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-400">
               <Users size={80} className="mb-6 text-purple-400 opacity-50"/>
               <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Kết Nối Tarot Reader</h2>
               <p className="text-base md:text-lg max-w-lg">Tính năng đặt lịch xem riêng với các Reader đang được phát triển. Vui lòng quay lại sau nhé!</p>
               <button onClick={() => setCurrentView('home')} className="mt-10 px-10 py-4 bg-white/5 border border-white/10 rounded-full text-white text-base hover:bg-white/10 transition-colors">
                 Quay lại Trang chủ
               </button>
            </div>
          )}

      </div>

      {showPaymentModal && selectedTierForPayment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"></div>
           <div className="relative bg-[#1a1625] w-full max-w-md md:max-w-lg rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl animate-scale-up">
              {!isProcessingPayment ? (
                <>
                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedTierForPayment.color} mx-auto mb-6 flex items-center justify-center shadow-lg`}>
                      <Wallet className="text-white w-10 h-10"/>
                    </div>
                    <h3 className="text-3xl font-bold text-white">Xác nhận thanh toán</h3>
                    <p className="text-amber-400 text-2xl font-bold mt-2">{selectedTierForPayment.price}</p>
                  </div>
                  
                  <div className="bg-black/30 p-6 rounded-2xl border border-white/5 mb-8 space-y-4">
                     <div className="flex justify-between text-base md:text-lg">
                       <span className="text-slate-400">Ngân hàng:</span>
                       <span className="text-white font-medium">MB Bank</span>
                     </div>
                     <div className="flex justify-between text-base md:text-lg items-center">
                       <span className="text-slate-400">Số tài khoản:</span>
                       <span className="text-amber-400 font-bold tracking-wider text-2xl bg-amber-900/20 px-3 py-1 rounded-lg">0999999999</span>
                     </div>
                     <div className="flex justify-between text-base md:text-lg">
                       <span className="text-slate-400">Chủ tài khoản:</span>
                       <span className="text-white font-medium">ADMIN TAROT</span>
                     </div>
                     <div className="flex justify-between text-base md:text-lg">
                       <span className="text-slate-400">Nội dung CK:</span>
                       <span className="text-purple-300 font-mono font-bold bg-purple-900/30 px-3 py-1 rounded">TAROT {userInfo.name || 'USER'}</span>
                     </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 md:py-5 rounded-2xl border border-white/10 text-slate-400 hover:bg-white/5 font-bold transition-colors text-lg">Hủy Bỏ</button>
                    <button onClick={processPayment} className="flex-[2] py-4 md:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold shadow-lg shadow-green-900/30 transition-all hover:-translate-y-1 text-lg">Đã Chuyển Khoản</button>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center">
                  <Loader2 className="w-20 h-20 text-purple-400 animate-spin mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">Đang xác nhận giao dịch</h3>
                  <p className="text-base md:text-lg text-slate-400">Vui lòng đợi trong giây lát...</p>
                </div>
              )}
           </div>
        </div>
      )}

      <style>{`
        /* Chỉnh thanh cuộn đẹp hơn */
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.6); }

        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .text-shadow-glow { text-shadow: 0 0 30px rgba(168,85,247,0.5); }

        @keyframes slide-in-right { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .animate-slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scale-up { from{transform:scale(0.9);opacity:0} to{transform:scale(1);opacity:1} }
        .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes shuffle { 0%,100%{transform:translate(0,0) rotate(0)} 25%{transform:translate(-10px,0) rotate(-3deg)} 50%{transform:translate(10px,0) rotate(3deg)} 75%{transform:translate(0,-5px) rotate(0)} }
        .animate-shuffle { animation: shuffle 0.5s infinite; }
        
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes spin-slow { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 40s linear infinite; }
        @keyframes spin-slow-reverse { 100% { transform: translate(-50%, -50%) rotate(-360deg); } }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 60s linear infinite; }

        @keyframes fade-in { from{opacity:0; transform:translateY(15px)} to{opacity:1; transform:translateY(0)} }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

const MenuButton = ({ icon, label, onClick, active, highlight }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all mb-2
      ${active ? 'bg-purple-900/30 text-white shadow-inner border border-purple-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
      ${highlight ? 'border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent' : ''}
    `}
  >
    <div className={`${active || highlight ? 'text-opacity-100 scale-110' : 'text-opacity-70'} ${highlight ? 'text-amber-400' : ''} transition-transform`}>{icon}</div>
    <span className={`text-base font-medium ${highlight ? 'text-amber-300' : ''}`}>{label}</span>
  </button>
);