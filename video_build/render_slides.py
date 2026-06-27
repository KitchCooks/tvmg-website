# -*- coding: utf-8 -*-
"""
Topic-themed sample slides (deliberately NOT TVMG brand colours).
Each video has its own identity + per-slide background variety:
  popia  -> CYBER PRIVACY : indigo/violet base, cyan + violet accents, lock/circuit
  safety -> HI-VIS        : graphite base, safety-yellow + orange, hazard stripes/chevrons
  fire   -> ALARM         : charcoal/ember base, red + amber, flame glow / alarm rings
Run: python3 render_slides.py
"""
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scripts import SCRIPTS

W,H=1920,1080
HERE=os.path.dirname(os.path.abspath(__file__)); FONTS=os.path.join(HERE,"fonts")
WHITE=(255,255,255)

def head(size,weight=800):
    f=ImageFont.truetype(os.path.join(FONTS,"Montserrat.ttf"),size)
    try:f.set_variation_by_axes([weight])
    except Exception:pass
    return f
def body(size,weight=400):
    f=ImageFont.truetype(os.path.join(FONTS,"Inter.ttf"),size)
    try:f.set_variation_by_axes([14,weight])
    except Exception:pass
    return f

def lerp(a,b,t):return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
def newL():return Image.new("RGBA",(W,H),(0,0,0,0))
def over(img,o):img.paste(Image.alpha_composite(img.convert("RGBA"),o).convert("RGB"),(0,0))

def grad(top,bottom):
    img=Image.new("RGB",(W,H),top);px=img.load()
    for y in range(H):
        c=lerp(top,bottom,y/(H-1))
        for x in range(W):px[x,y]=c
    return img

def glow(img,cx,cy,r,color,a=120,steps=44,blur=50):
    o=newL();d=ImageDraw.Draw(o)
    for i in range(steps,0,-1):
        rr=r*i/steps;aa=int(a*(1-i/steps)**1.7)
        d.ellipse([cx-rr,cy-rr,cx+rr,cy+rr],fill=color+(aa,))
    over(img,o.filter(ImageFilter.GaussianBlur(blur)))

def rings(img,cx,cy,radii,color,a=60,w=3):
    o=newL();d=ImageDraw.Draw(o)
    for r in radii:d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=color+(a,),width=w)
    over(img,o)

def linegrid(img,color,step,a):
    o=newL();d=ImageDraw.Draw(o)
    for x in range(0,W,step):d.line([(x,0),(x,H)],fill=color+(a,),width=1)
    for y in range(0,H,step):d.line([(0,y),(W,y)],fill=color+(a,),width=1)
    over(img,o)

def dots(img,color,step,r,a,x0=0,y0=0,x1=W,y1=H):
    o=newL();d=ImageDraw.Draw(o)
    y=y0
    while y<y1:
        x=x0
        while x<x1:
            d.ellipse([x-r,y-r,x+r,y+r],fill=color+(a,));x+=step
        y+=step
    over(img,o)

def hazard_stripes(img,color,a,band_x):
    """diagonal yellow/dark hazard band on the right."""
    o=newL();d=ImageDraw.Draw(o)
    d.polygon([(band_x,0),(W,0),(W,H),(band_x-260,H)],fill=color+(a,))
    over(img,o)
    o2=newL();d2=ImageDraw.Draw(o2)
    sw=70
    x=band_x-200
    while x<W+400:
        d2.line([(x,-50),(x-360,H+50)],fill=(10,10,12,70),width=sw)
        x+=sw*2
    # clip stripes to band via mask
    mask=Image.new("L",(W,H),0);md=ImageDraw.Draw(mask)
    md.polygon([(band_x,0),(W,0),(W,H),(band_x-260,H)],fill=255)
    img.paste(Image.alpha_composite(img.convert("RGBA"),o2).convert("RGB"),(0,0),mask)

def chevrons(img,x,y,n,size,color,a,gap):
    o=newL();d=ImageDraw.Draw(o)
    for i in range(n):
        yy=y+i*gap
        d.line([(x,yy),(x+size,yy+size*0.6),(x+2*size,yy)],fill=color+(a,),width=20,joint="curve")
    over(img,o)

# ---- topic icons (cover/close hero glyph) ----
def icon_lock(img,cx,cy,s,color,a):
    o=newL();d=ImageDraw.Draw(o)
    bw,bh=s*0.9,s*0.7;bx=cx-bw/2;by=cy-bh*0.2
    d.rounded_rectangle([bx,by,bx+bw,by+bh],radius=s*0.12,fill=color+(a,))
    sh=s*0.5;d.arc([cx-sh/2,by-sh*0.9,cx+sh/2,by+sh*0.3],180,360,fill=color+(min(255,a+120),),width=int(s*0.10))
    kr=s*0.10;d.ellipse([cx-kr,cy-kr*0.2,cx+kr,cy+kr*1.6],fill=(8,6,26,255))
    over(img,o)
def icon_triangle(img,cx,cy,s,color,a):
    o=newL();d=ImageDraw.Draw(o)
    d.polygon([(cx,cy-s/2),(cx+s*0.58,cy+s*0.5),(cx-s*0.58,cy+s*0.5)],fill=color+(a,),outline=color+(255,))
    d.line([(cx,cy-s/2),(cx+s*0.58,cy+s*0.5),(cx-s*0.58,cy+s*0.5),(cx,cy-s/2)],fill=color+(255,),width=12,joint="curve")
    d.rounded_rectangle([cx-s*0.05,cy-s*0.16,cx+s*0.05,cy+s*0.14],radius=8,fill=(20,18,10,255))
    d.ellipse([cx-s*0.06,cy+s*0.22,cx+s*0.06,cy+s*0.34],fill=(20,18,10,255))
    over(img,o)
def icon_flame(img,cx,cy,s,color,color2,a):
    o=newL();d=ImageDraw.Draw(o)
    d.polygon([(cx,cy-s/2),(cx+s*0.42,cy),(cx+s*0.34,cy+s*0.42),(cx,cy+s*0.5),(cx-s*0.34,cy+s*0.42),(cx-s*0.40,cy-s*0.05)],fill=color+(a,))
    d.polygon([(cx+s*0.02,cy-s*0.05),(cx+s*0.22,cy+s*0.18),(cx+s*0.16,cy+s*0.40),(cx,cy+s*0.48),(cx-s*0.16,cy+s*0.40),(cx-s*0.18,cy+s*0.16)],fill=color2+(255,))
    over(img,o)

# ================= THEMES =================
THEMES={
 "popia":dict(name="CYBER PRIVACY",dark=True,base=((20,16,52),(8,6,26)),
    accent=(34,211,238),accent2=(139,92,246),title=WHITE,sub=(190,196,235),mute=(120,120,180),icon="lock"),
 "safety":dict(name="HI-VIS SAFETY",dark=True,base=((30,31,37),(14,15,19)),
    accent=(255,212,0),accent2=(255,122,0),title=WHITE,sub=(214,214,218),mute=(150,150,156),icon="triangle"),
 "fire":dict(name="FIRE ALARM",dark=True,base=((30,16,12),(10,6,6)),
    accent=(239,68,68),accent2=(245,158,11),title=WHITE,sub=(244,206,196),mute=(170,120,110),icon="flame"),
}

def background(tid,variant):
    th=THEMES[tid]; img=grad(*th["base"]); acc=th["accent"]; acc2=th["accent2"]
    if tid=="popia":
        linegrid(img,acc,70,14)
        gx=0.80 if variant%2==0 else 0.24
        glow(img,W*gx,H*0.28,560,acc,120)
        glow(img,W*(1-gx),H*0.8,420,acc2,80)
        if variant==0:
            icon_lock(img,W*0.80,H*0.52,360,acc,40); rings(img,W*0.80,H*0.52,[260,360,460],acc,26,2)
        dots(img,acc,52,2,34,x0=W*0.55 if variant!=1 else 0,y0=H*0.55,x1=W,y1=H)
        if variant==1:
            o=newL();d=ImageDraw.Draw(o);d.rounded_rectangle([W*0.66,-40,W+40,H+40],radius=50,fill=acc2+(26,));over(img,o)
    elif tid=="safety":
        bx=W*0.66 if variant!=1 else W*0.74
        hazard_stripes(img,th["base"][0],255,bx)
        chevrons(img,W*0.83,H*0.14,5,64,acc,70,92)
        glow(img,W*0.16,H*0.84,460,acc2,60)
        if variant==2:
            o=newL();d=ImageDraw.Draw(o);d.rounded_rectangle([100,H-150,W-100,H-130],radius=10,fill=acc+(120,));over(img,o)
    else:  # fire
        glow(img,W*0.82,H*0.74,620,acc,150); glow(img,W*0.86,H*0.62,420,acc2,120)
        rings(img,W*0.82,H*0.4,[120,210,300,400],acc,46,3)
        if variant==0: icon_flame(img,W*0.82,H*0.46,300,acc,acc2,150)
        dots(img,acc2,58,2,24,x0=0,y0=H*0.62,x1=W*0.4,y1=H)
        if variant==1:
            o=newL();d=ImageDraw.Draw(o);d.polygon([(W*0.6,0),(W,0),(W,H),(W*0.42,H)],fill=acc+(34,));over(img,o)
    return img

# ---- text helpers ----
def tracked(draw,xy,text,font,fill,tr):
    x,y=xy
    for ch in text:draw.text((x,y),ch,font=font,fill=fill);x+=draw.textlength(ch,font=font)+tr
    return x
def tracked_w(draw,text,font,tr):return sum(draw.textlength(c,font=font)+tr for c in text)-tr
def wrap(draw,text,font,maxw):
    words=text.split();lines=[];cur=""
    for w in words:
        t=(cur+" "+w).strip()
        if draw.textlength(t,font=font)<=maxw:cur=t
        else:
            if cur:lines.append(cur)
            cur=w
    if cur:lines.append(cur)
    return lines

def eyebrow(img,draw,th,text,x,y,size=27):
    f=head(size,700);tw=tracked_w(draw,text.upper(),f,4);h=58;acc=th["accent"]
    o=newL();pd=ImageDraw.Draw(o)
    pd.rounded_rectangle([x,y,x+tw+72,y+h],radius=h//2,fill=acc+(34,),outline=acc+(150,),width=2)
    pd.ellipse([x+24,y+h//2-6,x+36,y+h//2+6],fill=acc+(255,));over(img,o)
    tracked(draw,(x+50,y+(h-size-4)//2),text.upper(),f,acc,4)
    return y+h

def title(draw,th,text,x,y,size,maxw,lh=1.02):
    f=head(size,800)
    for ln in wrap(draw,text,f,maxw):
        draw.text((x,y),ln,font=f,fill=th["title"]);y+=int(size*lh)
    return y

def foot(img,draw,th,topic,idx,total):
    col=th["sub"];acc=th["accent"]
    tracked(draw,(150,H-92),("SAMPLE · "+topic).upper(),head(22,700),col,3)
    gap=30;bx=W-150-(total-1)*gap
    for i in range(total):
        on=(i==idx);r=8 if on else 5
        draw.ellipse([bx+i*gap-r,H-84-r,bx+i*gap+r,H-84+r],fill=acc if on else th["mute"])

def watermark(img,draw,th,n):
    f=head(680,800);txt=f"{n:02d}";tw=draw.textlength(txt,font=f)
    o=newL();pd=ImageDraw.Draw(o)
    pd.text((W-tw-60,H-800),txt,font=f,fill=(0,0,0,0),stroke_width=3,stroke_fill=th["accent"]+(50,))
    over(img,o)

# ================= LAYOUTS =================
def cover(img,draw,th,s):
    x=150
    if th["icon"]=="lock": icon_lock(img,x+62,210,120,th["accent"],230)
    elif th["icon"]=="triangle": icon_triangle(img,x+66,212,130,th["accent"],200)
    else: icon_flame(img,x+62,206,128,th["accent"],th["accent2"],230)
    eyebrow(img,draw,th,s["eyebrow"],x,320)
    y=title(draw,th,s["title"],x,420,128,1180,1.0)
    draw.rounded_rectangle([x,y+28,x+170,y+38],radius=5,fill=th["accent"])
    if s.get("sub"):tracked(draw,(x,y+76),s["sub"].upper(),head(30,700),th["sub"],3)
    tracked(draw,(x,H-92),"SAMPLE TRAINING SNIPPET",head(24,700),th["mute"],4)

def statement(img,draw,th,s,idx,total):
    watermark(img,draw,th,idx);x=150
    eyebrow(img,draw,th,s["eyebrow"],x,300)
    y=title(draw,th,s["title"],x,392,118,1180,1.03)
    if s.get("sub"):
        fb=body(46,500);y+=24
        for ln in wrap(draw,s["sub"],fb,1080):draw.text((x,y),ln,font=fb,fill=th["sub"]);y+=62
    foot(img,draw,th,s["topic"],idx,total)

def bullets(img,draw,th,s,idx,total):
    watermark(img,draw,th,idx);x=150
    eyebrow(img,draw,th,s["eyebrow"],x,200)
    y=title(draw,th,s["title"],x,290,94,1180,1.0);y+=64;fb=body(46,600);acc=th["accent"]
    for it in s["items"]:
        o=newL();pd=ImageDraw.Draw(o)
        pd.rounded_rectangle([x,y-4,x+58,y+54],radius=16,fill=acc+(40,),outline=acc+(210,),width=3);over(img,o)
        draw.line([(x+16,y+26),(x+25,y+38),(x+44,y+14)],fill=acc,width=6,joint="curve")
        draw.text((x+86,y),it,font=fb,fill=th["title"]);y+=104
    foot(img,draw,th,s["topic"],idx,total)

def steps(img,draw,th,s,idx,total):
    x=150;eyebrow(img,draw,th,s["eyebrow"],x,210);title(draw,th,s["title"],x,300,94,1180,1.0)
    items=s["items"];n=len(items);top=600;gap=40;cw=(W-300-(n-1)*gap)/n;fb=body(40,600);acc=th["accent"]
    for i,it in enumerate(items):
        cx=x+i*(cw+gap)
        o=newL();cd=ImageDraw.Draw(o)
        cd.rounded_rectangle([cx,top,cx+cw,top+300],radius=26,fill=(255,255,255,16),outline=acc+(90,),width=2);over(img,o)
        bs=84;o2=newL();bd=ImageDraw.Draw(o2);bd.rounded_rectangle([cx+32,top+34,cx+32+bs,top+34+bs],radius=22,fill=acc+(255,));over(img,o2)
        nf=head(46,800);nt=str(i+1);ntw=draw.textlength(nt,font=nf)
        draw.text((cx+32+(bs-ntw)/2,top+52),nt,font=nf,fill=(10,10,16))
        ty=top+150
        for ln in wrap(draw,it,fb,cw-64):draw.text((cx+32,ty),ln,font=fb,fill=th["title"]);ty+=46
        if i<n-1:ay=top+150;draw.polygon([(cx+cw+8,ay-9),(cx+cw+34,ay),(cx+cw+8,ay+9)],fill=acc)
    foot(img,draw,th,s["topic"],idx,total)

def recap(img,draw,th,s,idx,total):
    x=150;eyebrow(img,draw,th,s["eyebrow"],x,250);title(draw,th,s["title"],x,340,98,1180,1.0)
    items=s["items"];n=len(items);top=650;gap=40;cw=(W-300-(n-1)*gap)/n;fb=head(58,800);acc=th["accent"]
    for i,it in enumerate(items):
        cx=x+i*(cw+gap)
        o=newL();cd=ImageDraw.Draw(o)
        cd.rounded_rectangle([cx,top,cx+cw,top+240],radius=28,fill=acc+(30,),outline=acc+(160,),width=3);over(img,o)
        tracked(draw,(cx+34,top+30),f"0{i+1}",head(34,800),acc,2)
        tw=draw.textlength(it,font=fb);f=fb
        if tw>cw-60:f=head(46,800);tw=draw.textlength(it,font=f)
        draw.text((cx+(cw-tw)/2,top+116),it,font=f,fill=th["title"])
    foot(img,draw,th,s["topic"],idx,total)

def close(img,draw,th,s,idx,total):
    cx=W/2;acc=th["accent"]
    glow(img,cx,H*0.42,560,acc,70)
    if th["icon"]=="lock": icon_lock(img,cx,250,150,acc,230)
    elif th["icon"]=="triangle": icon_triangle(img,cx,256,160,acc,200)
    else: icon_flame(img,cx,250,150,acc,th["accent2"],230)
    f=head(27,700);tw=tracked_w(draw,s["eyebrow"].upper(),f,4)
    tracked(draw,(cx-tw/2,400),s["eyebrow"].upper(),f,acc,4)
    ft=head(98,800);y=460
    for ln in wrap(draw,s["title"],ft,W-460):
        lw=draw.textlength(ln,font=ft);draw.text((cx-lw/2,y),ln,font=ft,fill=th["title"]);y+=110
    if s.get("sub"):
        fb=body(42,500)
        for ln in wrap(draw,s["sub"],fb,W-700):
            lw=draw.textlength(ln,font=fb);draw.text((cx-lw/2,y+16),ln,font=fb,fill=th["sub"]);y+=56
    draw.rounded_rectangle([cx-60,y+82,cx+60,y+88],radius=3,fill=acc)
    fu=head(30,700);uw=tracked_w(draw,"PRODUCED BY TVMG · TVMG.CO.ZA",fu,4)
    tracked(draw,(cx-uw/2,y+120),"PRODUCED BY TVMG · TVMG.CO.ZA",fu,th["sub"],4)

LAYOUTS={"statement":statement,"bullets":bullets,"steps":steps,"recap":recap}

def render_all():
    for v in SCRIPTS:
        d=os.path.join(HERE,"out",v["id"]);os.makedirs(d,exist_ok=True)
        th=THEMES[v["id"]];total=len(v["slides"])
        for i,s in enumerate(v["slides"]):
            s=dict(s);s["topic"]=v["topic_label"]
            img=background(v["id"],i%3);draw=ImageDraw.Draw(img)
            if s["layout"]=="cover":cover(img,draw,th,s)
            elif s["layout"]=="close":close(img,draw,th,s,i,total)
            else:LAYOUTS[s["layout"]](img,draw,th,s,i,total)
            img.save(os.path.join(d,f"slide_{i:02d}.png"),"PNG")
        print("rendered",v["id"],total)

if __name__=="__main__":
    render_all()
