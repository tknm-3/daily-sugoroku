-- マスターデータ投入 (SPEC 6章 ハプニング / 7章 おねがい)

-- 既存マスターを入れ替え
delete from happening_events;

insert into happening_events (theme_id, title_ja, effect_type, effect_value, emoji) values
-- 🌳 もりのたんけん
('forest', 'こびとにみちを教えてもらった！', 'MOVE_FORWARD', 3, '🧚'),
('forest', 'おおかみにおいかけられた！', 'WARP_START', null, '🐺'),
('forest', 'まほうのきのみを食べた！', 'EXTRA_DICE', null, '🍓'),
('forest', 'きが急に歩き出した！', 'MOVE_ALL', 2, '🌲'),
('forest', 'ようせいがいたずらした！', 'SWAP', null, '🧚‍♀️'),
('forest', 'ぬかるみにはまった！', 'SKIP', null, '💦'),
('forest', 'たからの地図を発見！', 'MOVE_FORWARD', 5, '🗺️'),
('forest', 'まほうの泉を発見！', 'FREE_MOVE', null, '⛲'),
('forest', 'もりのおうちで道に迷った', 'MOVE_BACK', -2, '🏚️'),
('forest', 'にじいろのちょうちょが道案内', 'EXTRA_DICE', null, '🦋'),
-- 🚀 うちゅうぼうけん
('space', 'ブラックホールに吸い込まれた！', 'MOVE_BACK', -5, '🕳️'),
('space', 'うちゅう人とともだちになった！', 'FREE_MOVE', null, '👽'),
('space', 'いんせきをよけた！', 'EXTRA_DICE', null, '☄️'),
('space', '無重力でういた！', 'SKIP', null, '🧑‍🚀'),
('space', '宇宙ステーションを発見！', 'MOVE_FORWARD', 4, '🛰️'),
('space', 'ロケットエンジンこしょう', 'MOVE_BACK', -3, '🚀'),
('space', '星の王子様と出会った！', 'MOVE_ALL', 2, '🤴'),
('space', '宇宙海賊が現れた！', 'SWAP', null, '🏴‍☠️'),
('space', '流れ星に乗った！', 'MOVE_FORWARD', 5, '🌠'),
('space', '宇宙人の歌を聞いた', 'EXTRA_DICE', null, '🎶'),
-- 🌊 うみのぼうけん
('ocean', '人魚が歌ってくれた！', 'MOVE_FORWARD', 3, '🧜‍♀️'),
('ocean', 'サメに追いかけられた！', 'SKIP', null, '🦈'),
('ocean', 'たからばこを発見！', 'MOVE_ALL', 2, '💰'),
('ocean', 'たこに足をつかまれた！', 'SWAP', null, '🐙'),
('ocean', '波に乗って飛んだ！', 'EXTRA_DICE', null, '🌊'),
('ocean', 'あらしが来た！', 'MOVE_BACK', -4, '⛈️'),
('ocean', '海の女王様に会った', 'FREE_MOVE', null, '👸'),
('ocean', 'くじらの背中で昼寝した', 'SKIP', null, '🐋'),
('ocean', '光る魚に案内された', 'MOVE_FORWARD', 3, '🐠'),
('ocean', '海底神殿を発見！', 'MOVE_FORWARD', 5, '🏛️'),
-- 🏠 まほうのおうち
('home', 'ぬいぐるみが夜中に動いてた！', 'SKIP', null, '🧸'),
('home', 'れいぞうこがおかしであふれた！', 'MOVE_ALL', 3, '🍫'),
('home', 'かくしドアを発見！', 'FREE_MOVE', null, '🚪'),
('home', 'まほうのほうきが暴走！', 'MOVE_BACK', -3, '🧹'),
('home', 'テーブルが空を飛んだ！', 'MOVE_FORWARD', 5, '🪑'),
('home', 'おふろが温泉になった！', 'EXTRA_DICE', null, '♨️'),
('home', '鏡の中に入れた！', 'SWAP', null, '🪞'),
('home', 'おもちゃが反乱した！', 'MOVE_BACK', -2, '🤖'),
('home', 'にわから宝が出てきた！', 'MOVE_ALL', 2, '💎'),
('home', 'まどからにじの橋が出た', 'FREE_MOVE', null, '🌈'),
-- 🦸 ヒーローとかいじゅう
('hero', 'かいじゅう出現！', 'MOVE_BACK', -3, '🦖'),
('hero', 'ヒーローに変身！', 'EXTRA_DICE', 2, '🦸'),
('hero', '秘密基地を発見！', 'MOVE_FORWARD', 5, '🏰'),
('hero', '悪者にやられた！', 'SKIP', null, '👹'),
('hero', '必殺技が決まった！', 'MOVE_ALL', 3, '💥'),
('hero', '仲間を助けた！', 'FREE_MOVE', null, '🤝'),
('hero', 'わなにかかった！', 'MOVE_BACK', -2, '🪤'),
('hero', '新しい武器をゲット！', 'EXTRA_DICE', null, '⚔️'),
('hero', '変装がバレた！', 'SWAP', null, '🥸'),
('hero', '街を守った！', 'MOVE_FORWARD', 4, '🏙️'),
-- 🌈 ゆめのくに
('dream', '空を飛んだ！', 'FREE_MOVE', null, '🕊️'),
('dream', 'ケーキの山を発見！', 'MOVE_ALL', 3, '🍰'),
('dream', '時計が逆に動いた', 'MOVE_BACK', -3, '🕰️'),
('dream', 'しゃべる動物が道案内', 'EXTRA_DICE', null, '🦊'),
('dream', 'おかしの雨が降った！', 'MOVE_ALL', 2, '🍬'),
('dream', '夢の中でまた夢を見た', 'MOVE_BACK', -2, '💤'),
('dream', 'まほうのつえを手に入れた！', 'MOVE_FORWARD', 5, '🪄'),
('dream', '夢から覚めそうになった', 'SKIP', null, '😪'),
('dream', 'にじの橋を渡った！', 'MOVE_FORWARD', 4, '🌉'),
('dream', 'しあわせのようせいに会えた！', 'SWAP', null, '🧚');

-- デフォルトのちいさなおねがい (family_id = null)
delete from wish_items where family_id is null;

insert into wish_items (family_id, text_ja, is_active) values
(null, 'ぎゅってして！（ハグ）', true),
(null, 'ハイタッチしよう！', true),
(null, 'いいところを1つ言ってもらおう', true),
(null, 'みんなでジャンプ3回！', true),
(null, 'かたたたき1回', true),
(null, 'いっしょに写真をとろう！', true),
(null, 'すきな食べ物を教えて！', true),
(null, 'すきな動物を教えて！', true),
(null, '10秒間だけ王様・女王様になる', true),
(null, '今すぐ変顔をしてみせて！', true);
