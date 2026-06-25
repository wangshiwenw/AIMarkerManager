/* eslint-disable no-unused-vars */

function updateHomePromptCount(){
  const prompt=document.getElementById('homePrompt');
  const count=document.getElementById('homePromptCount');
  if(!prompt||!count) return;
  count.textContent=`${prompt.value.length}/1000`;
}

function fillHomeExample(){
  const prompt=document.getElementById('homePrompt');
  if(!prompt) return;
  prompt.value='我想做一条老房翻新的抖音获客视频，目标是获取装修报价表单，时长15秒，面向首次装修和老房翻新用户。希望突出免费报价、透明预算、设计师上门量房，不要夸大承诺。';
  updateHomePromptCount();
}

function submitHomePrompt(btn){
  const homePrompt=document.getElementById('homePrompt');
  const createPrompt=document.querySelector('#create textarea');
  if(homePrompt&&createPrompt&&homePrompt.value.trim()){
    createPrompt.value=homePrompt.value.trim();
  }
  createProject(btn);
}

function toggleHomeCases(btn){
  const section=document.querySelector('.home-cases');
  const hero=document.querySelector('.home-hero');
  if(!section||!btn) return;
  const collapsed=section.classList.toggle('is-collapsed');
  if(hero) hero.classList.toggle('cases-collapsed',collapsed);
  btn.textContent=collapsed?'展开':'收起';
  btn.setAttribute('aria-expanded',String(!collapsed));
}

function renderAuth(isLoggedIn){
  return;
}

function loginDemoUser(){
  if(typeof notify==='function') notify('当前演示无需登录');
}

function logoutDemoUser(){
  if(typeof notify==='function') notify('当前演示无需登录');
}

document.addEventListener('DOMContentLoaded',()=>{
  const prompt=document.getElementById('homePrompt');
  if(prompt){
    prompt.addEventListener('input',updateHomePromptCount);
    updateHomePromptCount();
  }
});
