import os, re
files=[]
for dp,_,fn in os.walk('src'):
    for f in fn:
        if f.endswith(('.ts','.tsx')):
            files.append(os.path.join(dp,f).replace('\\','/'))
contents={f: open(f,'r',encoding='utf-8',errors='ignore').read() for f in files}
imports={f:set(re.findall(r'import .* from ["\'](.+?)["\']', c)) for f,c in contents.items()}
refs={f:set() for f in files}
for f,paths in imports.items():
    for p in paths:
        if p.startswith('.'):
            g=os.path.normpath(os.path.join(os.path.dirname(f),p)).replace('\\','/')
            found=False
            for ext in ['.tsx','.ts','.jsx','.js','/index.tsx','/index.ts']:
                cand=g+ext if not g.endswith(ext) else g
                if os.path.exists(cand):
                    refs[cand].add(f)
                    found=True
                    break
            if not found and os.path.exists(g):
                refs[g].add(f)
print('TOTAL_FILES', len(files))
unused=[f for f in files if len(refs[f])==0]
print('UNUSED_FILES', len(unused))
for f in sorted(unused):
    print(f)
