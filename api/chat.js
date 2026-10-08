import OpenAI from "openai";
import fs from "fs";
import path from "path";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
function loadKnowledge(){return JSON.parse(fs.readFileSync(path.join(process.cwd(),"data","temples.json"),"utf8"));}
function retrieve(k,name,q){
 const t=k.temples.find(x=>x.name===name)||k.temples[0], x=q.toLowerCase();
 const chunks=[
  {text:t.facts.join(". "),score:/architecture|gopuram|pillar|sculpture|art|building/.test(x)?3:1},
  {text:t.traditions.join(", "),score:/famous|tradition|festival|legend|special|significance/.test(x)?3:1},
  {text:t.timings,score:/time|timing|open|close|hours|darshan/.test(x)?3:1},
  {text:t.guidance,score:2},{text:`Deity: ${t.deity}`,score:/deity|god|goddess|who/.test(x)?3:1}
 ];
 return {temple:t,context:chunks.sort((a,b)=>b.score-a.score).map(x=>x.text).join("\n")};
}
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  const {question,temple,language="English"}=req.body||{};
  if(!question||!temple)return res.status(400).json({error:"question and temple are required"});
  const k=loadKnowledge(), r=retrieve(k,temple.name,question);
  if(!process.env.OPENAI_API_KEY)return res.status(200).json({answer:"AI backend is not configured yet. "+r.context.split("\n").slice(0,2).join(" ")});
  const instructions=`You are Yatra, an expert and respectful AI temple guide. Reply in ${language}. Answer naturally, not as a template. Use the retrieved knowledge for factual claims. Religious claims are traditions or beliefs, never medical guarantees. Do not invent rituals, dates, prices or current events. For current timing/seva questions where data is insufficient, tell the visitor to verify with the temple. Keep most answers under 150 words unless asked for depth.
Temple: ${r.temple.name}
Deity: ${r.temple.deity}
Retrieved knowledge:
${r.context}`;
  const response=await client.responses.create({model:process.env.OPENAI_MODEL||"gpt-6-luna",instructions,input:question});
  return res.status(200).json({answer:response.output_text,language});
 }catch(e){console.error(e);return res.status(500).json({error:"AI guide unavailable"});}
}