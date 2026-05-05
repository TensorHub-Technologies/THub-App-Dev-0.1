import{q as Ee,a as re,r as s,s as Q,az as mt,aA as ke,j as e,D as se,v as ne,w as ie,B as W,aH as xt,ay as Se,E as O,a1 as ft,c as z,i as H,y as le,P as E,N as gt,aI as jt,_ as Ae,V as yt,x as _,b as Te,S as U,aE as Ct,u as bt,aw as vt,aJ as Dt,M as kt,f as we,I as Ie,H as de,e as T,af as $e,n as oe,h as v,a5 as St,K as wt,z as It,G as Rt,aK as _t,aL as L}from"./index-Yom5Qwyo.js";import{D as Et,A as At}from"./AddDocStoreDialog-Dof5sH8J.js";import{B as Tt}from"./BackdropLoader-wklOCOzB.js";import{d as F}from"./documentstore-C_9MZLMw.js";import{I as $t}from"./IconSearch-BbI2Dale.js";import{L as Lt}from"./ListItemButton-c9g27GpJ.js";import{E as Nt}from"./ErrorBoundary-JQjfCKad.js";import{V as Mt}from"./ViewHeader-Df8plgQ8.js";import{v as zt,d as Le}from"./v4-BQ7AmRtV.js";import{T as Ne}from"./Table-GaKq3hXc.js";import{n as Vt}from"./nodes-BJs8o6cq.js";import{F as Ot}from"./FormControlLabel-BQ0OAxUz.js";import{C as Ft}from"./Checkbox-DWzG26U6.js";import{T as Me,a as ze,c as Ve,b as Z}from"./TableRow-D06nUR_y.js";import{T as Oe,t as Re}from"./TableCell-DRQ_Mmn8.js";import{A as Fe,d as Be,e as Pe,M as Bt}from"./MemoizedReactMarkdown-CxVKgqB8.js";import{u as Pt,C as qt}from"./ConfirmDialog-POFlVTec.js";import{I as Ut}from"./IconInfoCircle-MiXpFIBq.js";import{d as qe}from"./KeyboardArrowDown-JZz7OmeB.js";import{d as Ue}from"./Delete-Wtsq4ufR.js";import{d as Wt}from"./Edit-C_IHvrGG.js";import{i as G,r as J}from"./createSvgIcon-D-FeZhzU.js";import{I as Ht}from"./IconRefresh-lqEg4fYw.js";import{I as Gt}from"./IconVectorBezier2-dOz5MHKo.js";import{T as Jt}from"./TableHead-ClxjqBKK.js";import"./IconFiles-BuqlhZaX.js";import"./listItemButtonClasses-C61tLHNG.js";import"./IconCopy-BBbQhz9F.js";import"./StyledFab-BNR3Gudj.js";import"./Toolbar-CeZWvSnf.js";import"./IconArrowLeft-DB7obIsc.js";import"./IconEdit-CR0gR0XT.js";import"./TooltipWithParser-FDfmlo88.js";import"./index-DHgIAfxC.js";import"./toPropertyKey-C9c9JG92.js";const We=({show:a,dialogProps:r,onCancel:m,onDocLoaderSelected:C})=>{const $=document.getElementById("portal"),g=Ee(),u=re(),[i,d]=s.useState(""),[x,w]=s.useState([]),D=Q(F.getDocumentLoaders),A=f=>{d(f)};function j(f){return f.name.toLowerCase().indexOf(i.toLowerCase())>-1}s.useEffect(()=>{r.documentLoaders&&w(r.documentLoaders)},[r]),s.useEffect(()=>{D.request()},[]),s.useEffect(()=>{D.data&&w(D.data)},[D.data]),s.useEffect(()=>(g(a?{type:mt}:{type:ke}),()=>g({type:ke})),[a,g]);const N=a?e.jsxs(se,{fullWidth:!0,maxWidth:"md",open:a,onClose:m,"aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description",children:[e.jsx(ne,{sx:{fontSize:"1rem",p:3,pb:0},id:"alert-dialog-title",children:r.title}),e.jsxs(ie,{sx:{display:"flex",flexDirection:"column",gap:2,maxHeight:"75vh",position:"relative",px:3,pb:3},children:[e.jsx(W,{sx:{backgroundColor:u.palette.background.paper,pt:2,position:"sticky",top:0,zIndex:10},children:e.jsx(xt,{sx:{width:"100%",pr:2,pl:2,position:"sticky"},id:"input-search-credential",value:i,onChange:f=>A(f.target.value),placeholder:"Search",startAdornment:e.jsx(Se,{position:"start",children:e.jsx($t,{stroke:1.5,size:"1rem",color:u.palette.grey[500]})}),endAdornment:e.jsx(Se,{position:"end",sx:{cursor:"pointer",color:u.palette.grey[500],"&:hover":{color:u.palette.grey[900]}},title:"Clear Search",children:e.jsx(O,{stroke:1.5,size:"1rem",onClick:()=>A(""),style:{cursor:"pointer"}})}),"aria-describedby":"search-helper-text",inputProps:{"aria-label":"weight"}})}),e.jsx(ft,{sx:{width:"100%",display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:2,py:0,zIndex:9,borderRadius:"10px",[u.breakpoints.down("md")]:{maxWidth:370}},children:[...x].filter(j).map(f=>e.jsxs(Lt,{alignItems:"center",onClick:()=>C(f.name),sx:{border:1,borderColor:u.palette.grey[900]+25,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"start",textAlign:"left",gap:1,p:2},children:[e.jsx("div",{style:{width:50,height:50,borderRadius:"50%",backgroundColor:"white",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("img",{style:{width:"100%",height:"100%",padding:7,borderRadius:"50%",objectFit:"contain"},alt:f.name,src:`${z}/api/v1/node-icon/${f.name}`})}),e.jsx(H,{children:f.label})]},f.name))})]})]}):null;return le.createPortal(N,$)};We.propTypes={show:E.bool,dialogProps:E.object,onCancel:E.func,onDocLoaderSelected:E.func};const He=({show:a,dialogProps:r,onCancel:m,onDelete:C})=>{const $=document.getElementById("portal"),[g,u]=s.useState({}),[i,d]=s.useState(!1),[x,w]=s.useState([]),[D,A]=s.useState([]),j=Q(Vt.getSpecificNode),N=t=>(b,l)=>{const c={...g};c[t]=l,u(c)};s.useEffect(()=>{if(r.recordManagerConfig){const t=r.recordManagerConfig.name;if(t&&j.request(t),r.vectorStoreConfig){const b=r.vectorStoreConfig.name;b&&j.request(b)}}return()=>{u({}),d(!1),w([]),A([])}},[r]),s.useEffect(()=>{if(j.data){const t=gt.cloneDeep(jt(j.data,zt()));let b="vectorStoreConfig";t.category==="Record Manager"&&(b="recordManagerConfig");const l=[];for(const c in r[b].config){const p=t.inputParams.find(I=>I.name===c);if(!p||p.type==="credential")continue;let k={};const S=r[b].config[c];S&&(typeof S=="string"&&S.startsWith("{{")&&S.endsWith("}}")||(k={label:p==null?void 0:p.label,name:p==null?void 0:p.name,type:p==null?void 0:p.type,value:S},l.push(k)))}b==="vectorStoreConfig"?w([{label:t.label,name:t.name,category:t.category,id:t.id,paramValues:l}]):b==="recordManagerConfig"&&A([{label:t.label,name:t.name,category:t.category,id:t.id,paramValues:l}])}},[j.data]);const f=a?e.jsxs(se,{fullWidth:!0,maxWidth:r.recordManagerConfig?"md":"sm",open:a,onClose:m,"aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description",children:[e.jsx(ne,{sx:{fontSize:"1rem",p:3,pb:0},id:"alert-dialog-title",children:r.title}),e.jsxs(ie,{sx:{display:"flex",flexDirection:"column",gap:2,maxHeight:"75vh",position:"relative",px:3,pb:3},children:[e.jsx("span",{style:{marginTop:"20px"},children:r.description}),r.type==="STORE"&&r.recordManagerConfig&&e.jsx(Ot,{control:e.jsx(Ft,{checked:i,onChange:t=>d(t.target.checked)}),label:"Remove data from vector store and record manager"}),i&&e.jsxs("div",{children:[e.jsx(Me,{component:Ae,children:e.jsx(ze,{sx:{minWidth:650},"aria-label":"simple table",children:e.jsx(Ve,{children:e.jsx(Z,{sx:{"& td":{border:0}},children:e.jsx(Oe,{sx:{pb:0,pt:0},colSpan:6,children:e.jsx(W,{children:[...x,...D].map((t,b)=>e.jsxs(Fe,{expanded:g[t.name]||!0,onChange:N(t.name),disableGutters:!0,children:[e.jsx(Be,{expandIcon:e.jsx(Le,{}),"aria-controls":`nodes-accordian-${t.name}`,id:`nodes-accordian-header-${t.name}`,children:e.jsxs("div",{style:{display:"flex",flexDirection:"row",alignItems:"center"},children:[e.jsx("div",{style:{width:40,height:40,marginRight:10,borderRadius:"50%",backgroundColor:"white"},children:e.jsx("img",{style:{width:"100%",height:"100%",padding:7,borderRadius:"50%",objectFit:"contain"},alt:t.name,src:`${z}/api/v1/node-icon/${t.name}`})}),e.jsx(H,{variant:"h5",children:t.label})]})}),e.jsx(Pe,{children:t.paramValues[0]&&e.jsx(Ne,{sx:{minWidth:150},rows:t.paramValues,columns:Object.keys(t.paramValues[0])})})]},b))})})})})})}),e.jsx("span",{style:{marginTop:"30px",fontStyle:"italic",color:"#b35702"},children:"* Only data that were upserted with Record Manager will be deleted from vector store"})]})]}),e.jsxs(yt,{sx:{pr:3,pb:3},children:[e.jsx(_,{onClick:m,color:"primary",children:"Cancel"}),e.jsx(_,{variant:"contained",onClick:()=>C(r.type,r.file,i),color:"error",children:"Delete"})]})]}):null;return le.createPortal(f,$)};He.propTypes={show:E.bool,dialogProps:E.object,onCancel:E.func,onDelete:E.func};const Ge=({show:a,dialogProps:r,onCancel:m})=>{console.log(r,"dialogProps");const[C,$]=s.useState({}),[g,u]=s.useState(""),i=re(),d=Te(l=>l.customization),[x,w]=s.useState({}),D=Q(F.getDocumentStoreConfig),A=()=>`With the Upsert API, you can choose an existing document and reuse the same configuration for upserting.

\`\`\`python
import requests
import json

API_URL = "${z}/api/v1/document-store/upsert/${r.storeId}"
API_KEY = "your_api_key_here"

# use form data to upload files
form_data = {
    "files": ('my-another-file.pdf', open('my-another-file.pdf', 'rb'))
}

body_data = {
    "docId": "${r.loaderId}",
    "metadata": {}, # Add additional metadata to the document chunks
    "replaceExisting": True, # Replace existing document with the new upserted chunks
    "createNewDocStore": False, # Create a new document store
    "loaderName": "Custom Loader Name", # Override the loader name
    "splitter": json.dumps({"config":{"chunkSize":20000}}) # Override existing configuration
    # "loader": "",
    # "vectorStore": "",
    # "embedding": "",
    # "recordManager": "",
    # "docStore": ""
}

headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}"
}

def query(form_data):
    response = requests.post(API_URL, files=form_data, data=body_data, headers=headers)
    print(response)
    return response.json()

output = query(form_data)
print(output)
\`\`\`

\`\`\`javascript
// use FormData to upload files
let formData = new FormData();
formData.append("files", input.files[0]);
formData.append("docId", "${r.loaderId}");
formData.append("loaderName", "Custom Loader Name");
formData.append("splitter", JSON.stringify({"config":{"chunkSize":20000}}));
// Add additional metadata to the document chunks
formData.append("metadata", "{}");
// Replace existing document with the new upserted chunks
formData.append("replaceExisting", "true");
// Create a new document store
formData.append("createNewDocStore", "false");
// Override existing configuration
// formData.append("loader", "");
// formData.append("embedding", "");
// formData.append("vectorStore", "");
// formData.append("recordManager", "");
// formData.append("docStore", "");

async function query(formData) {
    const response = await fetch(
        "${z}/api/v1/document-store/upsert/${r.storeId}",
        {
            method: "POST",
            headers: {
                "Authorization": "Bearer <your_api_key_here>"
            },
            body: formData
        }
    );
    const result = await response.json();
    return result;
}

query(formData).then((response) => {
    console.log(response);
});
\`\`\`

\`\`\`bash
curl -X POST ${z}/api/v1/document-store/upsert/${r.storeId} \\
  -H "Authorization: Bearer <your_api_key_here>" \\
  -F "files=@<file-path>" \\
  -F "docId=${r.loaderId}" \\
  -F "loaderName=Custom Loader Name" \\
  -F "splitter={"config":{"chunkSize":20000}}" \\
  -F "metadata={}" \\
  -F "replaceExisting=true" \\
  -F "createNewDocStore=false" \\
  # Override existing configuration:
  # -F "loader=" \\
  # -F "embedding=" \\
  # -F "vectorStore=" \\
  # -F "recordManager=" \\
  # -F "docStore="
\`\`\`
`,j=()=>`With the Upsert API, you can choose an existing document and reuse the same configuration for upserting.
 
\`\`\`python
import requests

API_URL = "${z}/api/v1/document-store/upsert/${r.storeId}"
API_KEY = "your_api_key_here"

headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}"
}

def query(payload):
    response = requests.post(API_URL, json=payload, headers=headers)
    return response.json()

output = query({
    "docId": "${r.loaderId}",
    "metadata": "{}", # Add additional metadata to the document chunks
    "replaceExisting": True, # Replace existing document with the new upserted chunks
    "createNewDocStore": False, # Create a new document store
    "loaderName": "Custom Loader Name", # Override the loader name
    # Override existing configuration
    "loader": {
        "config": {
            "text": "This is a new text"
        }
    },
    "splitter": {
        "config": {
            "chunkSize": 20000
        }
    },
    # embedding: {},
    # vectorStore: {},
    # recordManager: {}
    # docStore: {}
})
print(output)
\`\`\`

\`\`\`javascript
async function query(data) {
    const response = await fetch(
        "${z}/api/v1/document-store/upsert/${r.storeId}",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer <your_api_key_here>"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

query({
    "docId": "${r.loaderId}",
    "metadata": "{}", // Add additional metadata to the document chunks
    "replaceExisting": true, // Replace existing document with the new upserted chunks
    "createNewDocStore": false, // Create a new document store
    "loaderName": "Custom Loader Name", // Override the loader name
    // Override existing configuration
    "loader": {
        "config": {
            "text": "This is a new text"
        }
    },
    "splitter": {
        "config": {
            "chunkSize": 20000
        }
    },
    // embedding: {},
    // vectorStore: {},
    // recordManager: {}
    // docStore: {}
}).then((response) => {
    console.log(response);
});
\`\`\`

\`\`\`bash
curl -X POST ${z}/api/v1/document-store/upsert/${r.storeId} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your_api_key_here>" \\
  -d '{
        "docId": "${r.loaderId}",
        "metadata": "{}",
        "replaceExisting": true,
        "createNewDocStore": false,
        "loaderName": "Custom Loader Name",
        "loader": {
            "config": {
                "text": "This is a new text"
            }
        },
        "splitter": {
            "config": {
                "chunkSize": 20000
            }
        }
        // Override existing configuration
        // "embedding": {},
        // "vectorStore": {},
        // "recordManager": {}
        // "docStore": {}
      }'

\`\`\`
`,N=l=>{const c={},p=new Set;let k=!1;l.forEach(S=>{const{node:I,nodeId:P,label:B,name:K,type:Y}=S;K==="files"&&(k=!0),p.add(I),c[I]||(c[I]={nodeIds:[],params:[]}),c[I].nodeIds.includes(P)||c[I].nodeIds.push(P);const q={label:B,name:K,type:Y};c[I].params.some(X=>JSON.stringify(X)===JSON.stringify(q))||c[I].params.push(q)});for(const S in c)c[S].nodeIds.sort();$(c),u(k?A():j())},f=l=>(c,p)=>{const k={...x};k[l]=p,w(k)};s.useEffect(()=>{D.data&&N(D.data)},[D.data]),s.useEffect(()=>{a&&r&&D.request(r.storeId,r.loaderId)},[a,r]);const t=document.getElementById("portal"),b=a?e.jsxs(se,{onClose:m,open:a,fullWidth:!0,maxWidth:"lg","aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description",children:[e.jsx(ne,{sx:{fontSize:"1rem"},id:"alert-dialog-title",children:r.title}),e.jsxs(ie,{children:[e.jsxs(W,{sx:{display:"flex",alignItems:"center",padding:2,mb:3,background:d.isDarkMode?"linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.1) 100%)":"linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",color:d.isDarkMode?"white":"#333333",fontWeight:400,borderRadius:2,border:`1px solid ${d.isDarkMode?"rgba(33, 150, 243, 0.3)":"rgba(33, 150, 243, 0.2)"}`,gap:1.5},children:[e.jsx(Ut,{size:20,style:{color:d.isDarkMode?"#64b5f6":"#1976d2",flexShrink:0}}),e.jsxs(W,{sx:{flex:1},children:[e.jsx("strong",{children:"Note:"})," Upsert API can only be used when the existing document loader has been upserted before."]})]}),e.jsx(Bt,{children:g}),e.jsx(H,{sx:{mt:3,mb:1},children:"You can override existing configurations:"}),e.jsx(U,{direction:"column",spacing:2,sx:{width:"100%",my:2},children:e.jsx(Ct,{sx:{borderColor:i.palette.primary[200]+75,p:2},variant:"outlined",children:Object.keys(C).sort().map(l=>e.jsxs(Fe,{expanded:x[l]||!1,onChange:f(l),disableGutters:!0,children:[e.jsx(Be,{expandIcon:e.jsx(Le,{}),"aria-controls":`nodes-accordian-${l}`,id:`nodes-accordian-header-${l}`,children:e.jsxs(U,{flexDirection:"row",sx:{gap:2,alignItems:"center",flexWrap:"wrap"},children:[e.jsx(H,{variant:"h5",children:l}),C[l].nodeIds.length>0&&C[l].nodeIds.map((c,p)=>e.jsx("div",{style:{display:"flex",flexDirection:"row",width:"max-content",borderRadius:15,background:"rgb(254,252,191)",padding:5,paddingLeft:10,paddingRight:10},children:e.jsx("span",{style:{color:"rgb(116,66,16)",fontSize:"0.825rem"},children:c})},p))]})}),e.jsx(Pe,{children:e.jsx(Ne,{rows:C[l].params.map(c=>{const{node:p,nodeId:k,...S}=c;return S}),columns:Object.keys(C[l].params[0]).slice(-3)})})]},l))})})]})]}):null;return le.createPortal(b,t)};Ge.propTypes={show:E.bool,dialogProps:E.object,onCancel:E.func};var ce={},Kt=G;Object.defineProperty(ce,"__esModule",{value:!0});var ue=ce.default=void 0,Yt=Kt(J()),Xt=e,Qt=(0,Yt.default)((0,Xt.jsx)("path",{d:"M10 4h4v4h-4zM4 16h4v4H4zm0-6h4v4H4zm0-6h4v4H4zm10 8.42V10h-4v4h2.42zm6.88-1.13-1.17-1.17c-.16-.16-.42-.16-.58 0l-.88.88L20 12.75l.88-.88c.16-.16.16-.42 0-.58zM11 18.25V20h1.75l6.67-6.67-1.75-1.75zM16 4h4v4h-4z"}),"AppRegistration");ue=ce.default=Qt;var pe={},Zt=G;Object.defineProperty(pe,"__esModule",{value:!0});var he=pe.default=void 0,ea=Zt(J()),ta=e,aa=(0,ea.default)((0,ta.jsx)("path",{d:"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"}),"NoteAdd");he=pe.default=aa;var me={},oa=G;Object.defineProperty(me,"__esModule",{value:!0});var Je=me.default=void 0,ra=oa(J()),sa=e,na=(0,ra.default)((0,sa.jsx)("path",{d:"M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"}),"Search");Je=me.default=na;var xe={},ia=G;Object.defineProperty(xe,"__esModule",{value:!0});var Ke=xe.default=void 0,la=ia(J()),da=e,ca=(0,la.default)((0,da.jsx)("path",{d:"M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"}),"Refresh");Ke=xe.default=ca;var fe={},ua=G;Object.defineProperty(fe,"__esModule",{value:!0});var Ye=fe.default=void 0,pa=ua(J()),ha=e,ma=(0,pa.default)((0,ha.jsx)("path",{d:"M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"}),"Code");Ye=fe.default=ma;const xa="/assets/doc_store_details_empty-B8g8M--k.svg",n=de(Oe)(({theme:a})=>({borderColor:a.palette.grey[900]+25,padding:"6px 16px",[`&.${Re.head}`]:{color:a.palette.grey[900]},[`&.${Re.body}`]:{fontSize:14,height:64}})),_e=de(Z)(()=>({"&:last-child td, &:last-child th":{border:0}})),Xe=de(a=>e.jsx(St,{elevation:0,anchorOrigin:{vertical:"bottom",horizontal:"right"},transformOrigin:{vertical:"top",horizontal:"right"},...a}))(({theme:a})=>({"& .MuiPaper-root":{borderRadius:6,marginTop:a.spacing(1),minWidth:180,boxShadow:"rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px","& .MuiMenu-list":{padding:"4px 0"},"& .MuiMenuItem-root":{"& .MuiSvgIcon-root":{fontSize:18,color:a.palette.text.secondary,marginRight:a.spacing(1.5)},"&:active":{backgroundColor:wt(a.palette.primary.main,a.palette.action.selectedOpacity)}}}})),Xa=()=>{var Ce,be,ve,De;const a=re(),r=Te(o=>o.customization),m=bt(),C=Ee();vt();const{confirm:$}=Pt(),g=(...o)=>C(It(...o)),u=(...o)=>C(Rt(...o)),i=Q(F.getSpecificDocumentStore),[d,x]=s.useState(null),[w,D]=s.useState(!0),[A,j]=s.useState(!1),[N,f]=s.useState(!1),[t,b]=s.useState({}),[l,c]=s.useState({}),[p,k]=s.useState(!1),[S,I]=s.useState({}),[P,B]=s.useState(!1),[K,Y]=s.useState({}),[q,X]=s.useState(!1),[Ze,et]=s.useState({}),[ge,ee]=s.useState(null),te=!!ge,{storeId:M}=Dt(),tt=o=>{m("/document-stores/"+M+"/"+o)},je=o=>{m("/document-stores/chunks/"+M+"/"+o)},at=o=>{m("/document-stores/query/"+o)},ot=o=>{k(!1),m("/document-stores/"+M+"/"+o)},rt=o=>{m("/document-stores/vector/"+o)},ye=()=>{I({title:"Select Document Loader"}),k(!0)},st=async o=>{try{await F.deleteVectorStoreDataFromStore(o)}catch(y){console.error(y)}},nt=async(o,y,V)=>{if(j(!0),B(!1),o==="STORE"){V&&await st(M);try{const h=await F.deleteDocumentStore(M);j(!1),h.data&&(g({message:"Store, Loader and associated document chunks deleted",options:{key:new Date().getTime()+Math.random(),variant:"success",action:R=>e.jsx(_,{style:{color:"white"},onClick:()=>u(R),children:e.jsx(O,{})})}}),m("/document-stores/"))}catch(h){j(!1),g({message:`Failed to delete Document Store: ${typeof h.response.data=="object"?h.response.data.message:h.response.data}`,options:{key:new Date().getTime()+Math.random(),variant:"error",persist:!0,action:R=>e.jsx(_,{style:{color:"white"},onClick:()=>u(R),children:e.jsx(O,{})})}})}}else if(o==="LOADER")try{const h=await F.deleteLoaderFromStore(M,y.id);j(!1),h.data&&(g({message:"Loader and associated document chunks deleted",options:{key:new Date().getTime()+Math.random(),variant:"success",action:R=>e.jsx(_,{style:{color:"white"},onClick:()=>u(R),children:e.jsx(O,{})})}}),ae())}catch(h){j(!1),g({message:`Failed to delete Document Loader: ${typeof h.response.data=="object"?h.response.data.message:h.response.data}`,options:{key:new Date().getTime()+Math.random(),variant:"error",persist:!0,action:R=>e.jsx(_,{style:{color:"white"},onClick:()=>u(R),children:e.jsx(O,{})})}})}},it=(o,y,V)=>{const h={title:"Delete",description:`Delete Loader ${o.loaderName} ? This will delete all the associated document chunks.`,vectorStoreConfig:y,recordManagerConfig:V,type:"LOADER",file:o};Y(h),B(!0)},lt=(o,y)=>{var h;const V={title:"Delete",description:`Delete Store ${(h=i.data)==null?void 0:h.name} ? This will delete all the associated loaders and document chunks.`,vectorStoreConfig:o,recordManagerConfig:y,type:"STORE"};Y(V),B(!0)},dt=async o=>{if(await $({title:"Refresh all loaders and upsert all chunks?",description:"This will re-process all loaders and upsert all chunks. This action might take some time.",confirmButtonName:"Refresh",cancelButtonName:"Cancel"})){ee(null),j(!0);try{(await F.refreshLoader(o)).data&&g({message:"Document store refresh successfully!",options:{key:new Date().getTime()+Math.random(),variant:"success",action:R=>e.jsx(_,{style:{color:"white"},onClick:()=>u(R),children:e.jsx(O,{})})}}),j(!1)}catch(h){j(!1),g({message:`Failed to refresh document store: ${typeof h.response.data=="object"?h.response.data.message:h.response.data}`,options:{key:new Date().getTime()+Math.random(),variant:"error",action:R=>e.jsx(_,{style:{color:"white"},onClick:()=>u(R),children:e.jsx(O,{})})}})}}},ct=()=>{const y={title:"Edit Document Store",type:"EDIT",cancelButtonName:"Cancel",confirmButtonName:"Update",data:{name:t.name,description:t.description,id:t.id}};c(y),f(!0)},ae=()=>{f(!1),i.request(M)},ut=o=>{o.preventDefault(),o.stopPropagation(),ee(o.currentTarget)},pt=(o,y)=>{et({title:"Upsert API",storeId:o,loaderId:y}),X(!0)},ht=()=>{ee(null)};return s.useEffect(()=>{i.request(M)},[]),s.useEffect(()=>{i.data&&b(i.data)},[i.data]),s.useEffect(()=>{i.error&&x(i.error)},[i.error]),s.useEffect(()=>{D(i.loading)},[i.loading]),e.jsxs(e.Fragment,{children:[e.jsx(kt,{children:d?e.jsx(Nt,{error:d}):e.jsxs(U,{flexDirection:"column",sx:{gap:3},children:[e.jsxs(Mt,{isBackButton:!0,isEditButton:!0,search:!1,title:t==null?void 0:t.name,description:t==null?void 0:t.description,onBack:()=>m("/document-stores"),onEdit:()=>ct(),children:[((t==null?void 0:t.status)==="STALE"||(t==null?void 0:t.status)==="UPSERTING")&&e.jsx(_,{onClick:ae,size:"small",color:"primary",title:"Refresh Document Store",children:e.jsx(Ht,{})}),e.jsx(we,{variant:"contained",sx:{ml:2,minWidth:200,borderRadius:2,height:"100%",color:"white"},startIcon:e.jsx(Ie,{}),onClick:ye,children:"Add Document Loader"}),e.jsx(_,{id:"document-store-header-action-button","aria-controls":te?"document-store-header-menu":void 0,"aria-haspopup":"true","aria-expanded":te?"true":void 0,variant:"outlined",disableElevation:!0,color:"secondary",onClick:ut,sx:{minWidth:150},endIcon:e.jsx(qe,{}),children:"More Actions"}),e.jsxs(Xe,{id:"document-store-header-menu",MenuListProps:{"aria-labelledby":"document-store-header-menu-button"},anchorEl:ge,open:te,onClose:ht,children:[e.jsxs(T,{disabled:(t==null?void 0:t.totalChunks)<=0||(t==null?void 0:t.status)==="UPSERTING",onClick:()=>je("all"),disableRipple:!0,children:[e.jsx(ue,{}),"View & Edit Chunks"]}),e.jsxs(T,{disabled:(t==null?void 0:t.totalChunks)<=0||(t==null?void 0:t.status)==="UPSERTING",onClick:()=>rt(t.id),disableRipple:!0,children:[e.jsx(he,{}),"Upsert All Chunks"]}),e.jsxs(T,{disabled:(t==null?void 0:t.totalChunks)<=0||(t==null?void 0:t.status)!=="UPSERTED",onClick:()=>at(t.id),disableRipple:!0,children:[e.jsx(Je,{}),"Retrieval Query"]}),e.jsxs(T,{disabled:(t==null?void 0:t.totalChunks)<=0||(t==null?void 0:t.status)!=="UPSERTED",onClick:()=>dt(t.id),disableRipple:!0,title:"Re-process all loaders and upsert all chunks",children:[e.jsx(Ke,{}),"Refresh"]}),e.jsx($e,{sx:{my:.5}}),e.jsxs(T,{onClick:()=>lt(t.vectorStoreConfig,t.recordManagerConfig),disableRipple:!0,children:[e.jsx(Ue,{}),"Delete"]})]})]}),e.jsx(Et,{status:t==null?void 0:t.status}),((be=(Ce=i.data)==null?void 0:Ce.whereUsed)==null?void 0:be.length)>0&&e.jsxs(U,{flexDirection:"row",sx:{gap:2,alignItems:"center",flexWrap:"wrap"},children:[e.jsxs("div",{style:{paddingLeft:"15px",paddingRight:"15px",paddingTop:"10px",paddingBottom:"10px",fontSize:"0.9rem",width:"max-content",display:"flex",flexDirection:"row",alignItems:"center"},children:[e.jsx(Gt,{style:{marginRight:5},size:17}),"Chatflows Used:"]}),i.data.whereUsed.map((o,y)=>e.jsx(oe,{clickable:!0,style:{width:"max-content",borderRadius:"25px",boxShadow:r.isDarkMode?"0 2px 14px 0 rgb(255 255 255 / 10%)":"0 2px 14px 0 rgb(32 40 45 / 10%)"},label:o.name,onClick:()=>m("/canvas/"+o.id)},y))]}),!w&&t&&!((ve=t==null?void 0:t.loaders)!=null&&ve.length)?e.jsxs(U,{sx:{alignItems:"center",justifyContent:"center"},flexDirection:"column",children:[e.jsx(W,{sx:{p:2,height:"auto"},children:e.jsx("img",{style:{objectFit:"cover",height:"16vh",width:"auto"},src:xa,alt:"doc_store_details_emptySVG"})}),e.jsx("div",{children:"No Document Added Yet"}),e.jsx(we,{variant:"contained",sx:{borderRadius:2,height:"100%",mt:2,color:"white"},startIcon:e.jsx(Ie,{}),onClick:ye,children:"Add Document Loader"})]}):e.jsx(Me,{sx:{border:1,borderColor:a.palette.grey[900]+25,borderRadius:2},component:Ae,children:e.jsxs(ze,{sx:{minWidth:650},"aria-label":"simple table",children:[e.jsx(Jt,{sx:{backgroundColor:r.isDarkMode?a.palette.common.black:a.palette.grey[100],height:56},children:e.jsxs(Z,{children:[e.jsx(n,{children:" "}),e.jsx(n,{children:"Loader"}),e.jsx(n,{children:"Splitter"}),e.jsx(n,{children:"Source(s)"}),e.jsx(n,{children:"Chunks"}),e.jsx(n,{children:"Chars"}),e.jsx(n,{children:"Actions"})]})}),e.jsx(Ve,{children:w?e.jsxs(e.Fragment,{children:[e.jsxs(_e,{children:[e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})})]}),e.jsxs(_e,{children:[e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})}),e.jsx(n,{children:e.jsx(v,{variant:"text"})})]})]}):e.jsx(e.Fragment,{children:(t==null?void 0:t.loaders)&&(t==null?void 0:t.loaders.length)>0&&(t==null?void 0:t.loaders.map((o,y)=>e.jsx(Qe,{index:y,loader:o,theme:a,onEditClick:()=>tt(o.id),onViewChunksClick:()=>je(o.id),onDeleteClick:()=>it(o,t==null?void 0:t.vectorStoreConfig,t==null?void 0:t.recordManagerConfig),onChunkUpsert:()=>m(`/document-stores/vector/${t.id}/${o.id}`),onViewUpsertAPI:()=>pt(t.id,o.id)},y)))})})]})}),((De=i.data)==null?void 0:De.status)==="STALE"&&e.jsx("div",{style:{width:"100%",textAlign:"center",marginTop:"20px"},children:e.jsx(H,{color:"warning",style:{color:"darkred",fontWeight:500,fontStyle:"italic",fontSize:12},children:"Some files are pending processing. Please Refresh to get the latest status."})})]})}),N&&e.jsx(At,{dialogProps:l,show:N,onCancel:()=>f(!1),onConfirm:ae}),p&&e.jsx(We,{show:p,dialogProps:S,onCancel:()=>k(!1),onDocLoaderSelected:ot}),P&&e.jsx(He,{show:P,dialogProps:K,onCancel:()=>B(!1),onDelete:nt}),q&&e.jsx(Ge,{show:q,dialogProps:Ze,onCancel:()=>X(!1)}),A&&e.jsx(Tt,{open:A}),e.jsx(qt,{})]})};function Qe(a){var i;const[r,m]=s.useState(null),C=!!r,$=d=>{d.preventDefault(),d.stopPropagation(),m(d.currentTarget)},g=()=>{m(null)},u=(d,x)=>d&&Array.isArray(d)&&d.length>0?d.map(w=>w.name).join(", "):x&&typeof x=="string"&&x.includes("base64")?_t(x):x&&typeof x=="string"&&x.startsWith("[")&&x.endsWith("]")?JSON.parse(x).join(", "):x||"No source";return e.jsx(e.Fragment,{children:e.jsxs(Z,{hover:!0,sx:{"&:last-child td, &:last-child th":{border:0},cursor:"pointer"},children:[e.jsx(n,{onClick:a.onViewChunksClick,scope:"row",style:{width:"5%"},children:e.jsx("div",{style:{display:"flex",width:"20px",height:"20px",backgroundColor:((i=a.loader)==null?void 0:i.status)==="SYNC"?"#00e676":"#ffe57f",borderRadius:"50%"}})}),e.jsx(n,{onClick:a.onViewChunksClick,scope:"row",children:a.loader.loaderName}),e.jsx(n,{onClick:a.onViewChunksClick,children:a.loader.splitterName??"None"}),e.jsx(n,{onClick:a.onViewChunksClick,children:u(a.loader.files,a.loader.source)}),e.jsx(n,{onClick:a.onViewChunksClick,children:a.loader.totalChunks&&e.jsx(oe,{variant:"outlined",size:"small",label:a.loader.totalChunks.toLocaleString()})}),e.jsx(n,{onClick:a.onViewChunksClick,children:a.loader.totalChars&&e.jsx(oe,{variant:"outlined",size:"small",label:a.loader.totalChars.toLocaleString()})}),e.jsx(n,{children:e.jsxs("div",{children:[e.jsx(_,{id:"document-store-action-button","aria-controls":C?"document-store-action-customized-menu":void 0,"aria-haspopup":"true","aria-expanded":C?"true":void 0,disableElevation:!0,onClick:d=>$(d),endIcon:e.jsx(qe,{}),children:"Options"}),e.jsxs(Xe,{id:"document-store-actions-customized-menu",MenuListProps:{"aria-labelledby":"document-store-actions-customized-button"},anchorEl:r,open:C,onClose:g,children:[e.jsxs(T,{onClick:a.onEditClick,disableRipple:!0,children:[e.jsx(Wt,{}),"Preview & Process"]}),e.jsxs(T,{onClick:a.onViewChunksClick,disableRipple:!0,children:[e.jsx(ue,{}),"View & Edit Chunks"]}),e.jsxs(T,{onClick:a.onChunkUpsert,disableRipple:!0,children:[e.jsx(he,{}),"Upsert Chunks"]}),e.jsxs(T,{onClick:a.onViewUpsertAPI,disableRipple:!0,children:[e.jsx(Ye,{}),"View API"]}),e.jsx($e,{sx:{my:.5}}),e.jsxs(T,{onClick:a.onDeleteClick,disableRipple:!0,children:[e.jsx(Ue,{}),"Delete"]})]})]})})]},a.index)})}Qe.propTypes={loader:L.any,index:L.number,open:L.bool,theme:L.any,onViewChunksClick:L.func,onEditClick:L.func,onDeleteClick:L.func,onChunkUpsert:L.func,onViewUpsertAPI:L.func};export{Xa as default};
