import {Easing, interpolate} from 'remotion';

export const LOCAL_THEME = {
  ink: '#243347', night: '#101E35', nightLight: '#263F60', blue: '#85C8E5',
  cream: '#F5EBD7', paper: '#FFF8E9', milk: '#FFF9E9', shadow: '#D8D0BC',
  green: '#71B780', greenDark: '#347357', yellow: '#E9BE63', honey: '#B9843E',
  pink: '#D58C8D', red: '#C66C69', brown: '#655144', muted: '#A8BDD0',
  font: 'MochiLocal', ease: Easing.bezier(.22,.75,.25,1),
  spring: {damping: 19, stiffness: 115, mass: .9},
} as const;

export const tween = (value:number, input:number[], output:number[]) => interpolate(value,input,output,{
  easing:LOCAL_THEME.ease,extrapolateLeft:'clamp',extrapolateRight:'clamp',
});
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const DEMO_SECONDS=114;
export const VOICE_SECONDS=109.5;
export const ASSET_ROOT='episodes/mochi-local-comparison';
export type Action='phone'|'city'|'clock'|'feelings'|'blanket'|'time'|'work'|'tasks'|'drain'|'balance'|'putdown'|'tea'|'bloom';
export const SHOTS: {from:number;to:number;action:Action;title:string;note:string}[]=[
  {from:0,to:11,action:'phone',title:'Mắt đã mỏi.\nTay vẫn lướt.',note:'01:30 · ĐÊM CHƯA MUỐN NGỦ'},
  {from:11,to:16.5,action:'city',title:'Có những mệt mỏi\nkhó gọi thành tên.',note:'MỘT NGÀY VỪA ĐI QUA'},
  {from:16.5,to:25.5,action:'clock',title:'Một ngày.\nBảy cơn sóng nhỏ.',note:'ĐI QUA 24 GIỜ CÙNG MOCHI'},
  {from:25.5,to:32.5,action:'feelings',title:'Gọi tên cảm xúc,\nđể hiểu mình hơn.',note:'KHÔNG CẦN VỘI VÀNG'},
  {from:32.5,to:44,action:'blanket',title:'“Thêm một chút nữa\nrồi mình sẽ ngủ.”',note:'CẢM XÚC ĐẦU TIÊN'},
  {from:44,to:56.7,action:'time',title:'Hôm nay, mình đã\nsống cho mình chưa?',note:'KHOẢNG RIÊNG BÉ XÍU'},
  {from:56.7,to:68,action:'work',title:'Ban ngày, thời gian\nthuộc về rất nhiều người.',note:'NHỮNG VIỆC CHƯA XONG'},
  {from:68,to:78.9,action:'tasks',title:'Đêm xuống,\nmọi đòi hỏi im dần.',note:'MỘT KHOẢNG LẶNG RIÊNG'},
  {from:78.9,to:86,action:'drain',title:'Đổi giấc ngủ\nlấy chút tự do.',note:'NGÀY MAI ĐANG ĐỢI'},
  {from:86,to:94.2,action:'balance',title:'Nhưng cơ thể\ncũng cần được lắng nghe.',note:'NHẸ TAY VỚI CHÍNH MÌNH'},
  {from:94.2,to:103,action:'putdown',title:'Úp điện thoại xuống.\nChừa cho mình một khoảng.',note:'MỘT NGHI THỨC NHỎ'},
  {from:103,to:109.5,action:'tea',title:'Một cốc nước ấm.\nMột chút thời gian của mình.',note:'CHẬM LẠI MỘT CHÚT'},
  {from:109.5,to:114,action:'bloom',title:'Đêm nay,\nmong bạn ngủ yên.',note:'BÉ MOCHI MẦM XANH'},
];
