import{c as t,j as e,A as d,C as r,l as c,z as l,D as n,o}from"./index-DP7CzVNy.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=t("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=t("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=t("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=t("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=t("UserCog",[["circle",{cx:"18",cy:"15",r:"3",key:"gjjjvw"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M10 15H6a4 4 0 0 0-4 4v2",key:"1nfge6"}],["path",{d:"m21.7 16.4-.9-.3",key:"12j9ji"}],["path",{d:"m15.2 13.9-.9-.3",key:"1fdjdi"}],["path",{d:"m16.6 18.7.3-.9",key:"heedtr"}],["path",{d:"m19.1 12.2.3-.9",key:"1af3ki"}],["path",{d:"m19.6 18.7-.4-1",key:"1x9vze"}],["path",{d:"m16.8 12.3-.4-1",key:"vqeiwj"}],["path",{d:"m14.3 16.6 1-.4",key:"1qlj63"}],["path",{d:"m20.7 13.8 1-.4",key:"1v5t8k"}]]),u=[{icon:p,title:"פרופיל משתמש",desc:"פרטי המתאמת, חתימה ופרטי קשר."},{icon:l,title:"התראות",desc:"ניהול ערוצי התראה: דוא״ל, SMS ופוש."},{icon:m,title:"שפה ואזור",desc:"שפת ממשק (עברית), אזור זמן ופורמט תאריך."},{icon:h,title:"פרטיות ואבטחה",desc:"סיסמה, אימות דו-שלבי וניהול הרשאות."}];function j(){const a=()=>{confirm("לאפס את כל הנתונים השמורים מקומית? (סטטוסי פעולות, התראות שנקראו, העדפות תצוגה)")&&(n(),o.success("הנתונים אופסו. רענני את הדף כדי לראות את המצב ההתחלתי."))};return e.jsx(d,{title:"הגדרות",subtitle:"העדפות מערכת וחשבון",children:e.jsxs("div",{className:"space-y-6 max-w-4xl",children:[e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:u.map(s=>{const i=s.icon;return e.jsx(r,{className:"hover:border-primary/30 cursor-pointer transition-colors",children:e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0",children:e.jsx(i,{className:"w-5 h-5","aria-hidden":"true"})}),e.jsxs("div",{children:[e.jsx("div",{className:"font-semibold text-foreground",children:s.title}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:s.desc})]})]})},s.title)})}),e.jsxs(r,{children:[e.jsx(c,{title:"ניהול נתוני דמו",subtitle:"כל הנתונים נשמרים מקומית בדפדפן (localStorage תחת libi:v1)"}),e.jsxs("div",{className:"flex items-start gap-4 p-4 rounded-lg bg-muted/40 border border-border",children:[e.jsx("div",{className:"w-11 h-11 rounded-xl bg-warning-soft text-warning-foreground flex items-center justify-center shrink-0",children:e.jsx(x,{className:"w-5 h-5","aria-hidden":"true"})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("div",{className:"font-semibold text-foreground",children:"איפוס נתוני דמו"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1 leading-relaxed",children:"מחיקת כל הסטטוסים שעודכנו במערכת: פעולות שסומנו כהושלמו, התראות שנקראו, מצב באנרים והעדפת תצוגה. השרת והקובץ המקורי אינם נפגעים — חוזרים למצב התחלתי של הדמו."}),e.jsxs("button",{type:"button",onClick:a,className:"mt-3 flex items-center gap-2 px-3 h-9 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity",children:[e.jsx(y,{className:"w-4 h-4","aria-hidden":"true"})," איפוס נתוני דמו"]})]})]})]})]})})}export{j as default};
