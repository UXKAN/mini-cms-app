// ── Page Components: Leden, Ondernemers, Donaties, Toezeggingen, Evenementen ──
// Depends on: window.DB, window.Card, window.Badge, etc.

const { useState: useStateP, useEffect: useEffectP } = React;
const MONTHS_NL = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
const MONTHS_FULL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
const EVENT_COLORS = { religieus: 'accent', fundraising: 'warning', algemeen: 'grey' };

// ── Leden Page ───────────────────────────────────────────────────────────────
function LedenPage() {
  const [q, setQ] = useStateP('');
  const [sortBy, setSortBy] = useStateP('naam');
  const [sortDir, setSortDir] = useStateP('asc');
  const [selected, setSelected] = useStateP(null);
  const [editMode, setEditMode] = useStateP(false);
  const [editData, setEditData] = useStateP(null);
  const [addOpen, setAddOpen] = useStateP(false);
  const [tab, setTab] = useStateP('leden'); // 'leden' | 'gezinnen'
  const [newDonor, setNewDonor] = useStateP({ naam:'', tel:'', adres:'', postcode_plaats:'', email:'', iban:'', bedrag_maand:'' });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const allLeden = window.DB.donors.filter(d => d.type === 'particulier');
  const leden = allLeden
    .filter(d => d.naam.toLowerCase().includes(q.toLowerCase()) || d.email.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // ── Gezinnen: group by last name ──────────────────────────────────────────
  const getLast = (naam) => naam.trim().split(/\s+/).pop();
  const gezinMap = {};
  allLeden.forEach(d => {
    const last = getLast(d.naam);
    if (!gezinMap[last]) gezinMap[last] = [];
    gezinMap[last].push(d);
  });
  const gezinnen = Object.entries(gezinMap)
    .filter(([, leden]) => leden.length >= 2)
    .map(([naam, leden]) => ({
      naam,
      leden,
      aantalLeden: leden.length,
      totaalPerMaand: leden.reduce((s, d) => s + d.bedrag_maand, 0),
      gemPerPersoon: Math.round(leden.reduce((s, d) => s + d.bedrag_maand, 0) / leden.length),
    }))
    .sort((a, b) => b.aantalLeden - a.aantalLeden || b.totaalPerMaand - a.totaalPerMaand);

  const SortTh = ({ col, label }) => {
    const active = sortBy === col;
    return (
      <th onClick={() => toggleSort(col)} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:active?T.accentDark:T.inkMuted, fontSize:11, letterSpacing:'0.05em', textTransform:'uppercase', cursor:'pointer', whiteSpace:'nowrap', userSelect:'none' }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↕</span>}
      </th>
    );
  };

  const cols = [
    { key:'naam', label:'Naam', render: (v,r) => <span style={{fontWeight:600,color:T.ink}}>{v}</span> },
    { key:'email', label:'E-mail' },
    { key:'tel', label:'Telefoon' },
    { key:'postcode_plaats', label:'Woonplaats' },
    { key:'bedrag_maand', label:'Per maand', render: v => <span style={{fontWeight:600,color:T.accentDark}}>{eur(v)}</span> },
    { key:'actief', label:'Status', render: v => <Badge label={v ? 'Actief' : 'Inactief'} color={v ? 'accent' : 'grey'}/> },
  ];

  // Tab button style
  const tabSt = (active) => ({
    padding:'8px 18px', border:'none', borderBottom:`2px solid ${active?T.accent:'transparent'}`,
    background:'transparent', fontFamily:'var(--font-sans)', fontSize:14, fontWeight: active?600:400,
    color: active?T.accent:T.inkMuted, cursor:'pointer', transition:'all 0.15s',
  });

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:400 }}>Leden overzicht</h1>
          <p style={{ fontSize:13, color:T.inkMuted, marginTop:4 }}>{allLeden.length} particuliere donors</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <SearchInput value={q} onChange={setQ} placeholder="Zoek op naam of e-mail…"/>
          <Button onClick={() => setAddOpen(true)}>+ Nieuw lid</Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, marginBottom:16, gap:4 }}>
        <button style={tabSt(tab==='leden')} onClick={() => setTab('leden')}>Alle leden ({allLeden.length})</button>
        <button style={tabSt(tab==='gezinnen')} onClick={() => setTab('gezinnen')}>
          Gezinnen ({gezinnen.length})
          {gezinnen.filter(g => g.gemPerPersoon < 15).length > 0 && (
            <span style={{ marginLeft:8, display:'inline-flex', alignItems:'center', justifyContent:'center', width:18, height:18, borderRadius:'50%', background:T.warning, color:'white', fontSize:10, fontWeight:700 }}>
              {gezinnen.filter(g => g.gemPerPersoon < 15).length}
            </span>
          )}
        </button>
      </div>

      {tab === 'leden' && (
        <Card>
          {/* Sort controls */}
          <div style={{ display:'flex', gap:8, padding:'12px 14px', borderBottom:`1px solid ${T.border}`, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:12, color:T.inkMuted, fontWeight:600, marginRight:4 }}>Sorteer op:</span>
            {[['naam','Naam'],['bedrag_maand','Bedrag'],['startdatum','Lid sinds']].map(([k,lbl]) => (
              <button key={k} onClick={() => toggleSort(k)}
                style={{ padding:'4px 12px', borderRadius:100, border:`1px solid ${sortBy===k?T.accent:T.border}`, background:sortBy===k?T.accentLight:'transparent', color:sortBy===k?T.accentDark:T.inkMuted, fontSize:12, fontWeight:sortBy===k?600:400, cursor:'pointer', fontFamily:'var(--font-sans)', transition:'all 0.15s' }}>
                {lbl} {sortBy===k ? (sortDir==='asc'?'↑':'↓') : ''}
              </button>
            ))}
          </div>
          <Table columns={cols} rows={leden} onRowClick={r => { setSelected(r); setEditData({...r}); setEditMode(false); }}/>
        </Card>
      )}

      {tab === 'gezinnen' && (
        <div>
          {/* Alert summary */}
          {gezinnen.filter(g => g.gemPerPersoon < 15).length > 0 && (
            <div style={{ padding:'14px 18px', background:T.warningLight, border:`1px solid oklch(0.60 0.14 55 / 0.3)`, borderRadius:T.radiusSm, marginBottom:16, display:'flex', alignItems:'flex-start', gap:12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.warning} strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'oklch(0.40 0.12 55)', marginBottom:2 }}>
                  {gezinnen.filter(g => g.gemPerPersoon < 15).length} gezinnen betalen minder dan €15/persoon
                </div>
                <div style={{ fontSize:12, color:'oklch(0.50 0.10 55)' }}>
                  Overweeg om deze gezinnen te benaderen over het verhogen van hun lidmaatschapsbijdrage.
                </div>
              </div>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {gezinnen.map(g => {
              const lowAlert = g.gemPerPersoon < 15;
              return (
                <Card key={g.naam} style={{ padding:'18px 20px', borderLeft:`3px solid ${lowAlert ? T.warning : T.accent}` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                        <span style={{ fontFamily:'var(--font-serif)', fontSize:18, fontWeight:400 }}>Familie {g.naam}</span>
                        <Badge label={`${g.aantalLeden} leden`} color="grey"/>
                        {lowAlert && (
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:100, background:T.warningLight, color:T.warning, fontSize:11, fontWeight:700 }}>
                            ⚠ Benaderen
                          </span>
                        )}
                      </div>
                      <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                        <div>
                          <span style={{ fontSize:11, color:T.inkSubtle, display:'block', marginBottom:1 }}>Totaal/maand</span>
                          <span style={{ fontSize:18, fontWeight:700, color:lowAlert?T.warning:T.accentDark, fontFamily:'var(--font-serif)' }}>{eur(g.totaalPerMaand)}</span>
                        </div>
                        <div>
                          <span style={{ fontSize:11, color:T.inkSubtle, display:'block', marginBottom:1 }}>Gemiddeld/persoon</span>
                          <span style={{ fontSize:18, fontWeight:700, color:lowAlert?T.warning:T.ink, fontFamily:'var(--font-serif)' }}>{eur(g.gemPerPersoon)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:T.inkMuted, textAlign:'right' }}>
                      {g.leden.map(l => (
                        <div key={l.id} style={{ marginBottom:2 }}>
                          {l.naam} — <strong style={{color:T.ink}}>{eur(l.bedrag_maand)}/mnd</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  {lowAlert && (
                    <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                      <span style={{ fontSize:12, color:'oklch(0.50 0.10 55)' }}>
                        Gemiddeld bijdrage van {eur(g.gemPerPersoon)}/persoon — onder de aanbevolen €15/maand
                      </span>
                      <Button size="sm" variant="secondary" onClick={() => alert(`Neem contact op met familie ${g.naam}:\n${g.leden.map(l=>`• ${l.naam} (${l.tel || l.email})`).join('\n')}`)}>
                        Contact opnemen
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail / Edit modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={editMode ? 'Lid bewerken' : (selected?.naam || '')} width={520}>
        {selected && (
          <div style={{ padding:24 }}>
            {editMode ? (
              <div>
                {[['naam','Naam'],['email','E-mail'],['tel','Telefoon'],['adres','Adres'],['postcode_plaats','Postcode & Woonplaats'],['iban','IBAN'],['bedrag_maand','Bedrag per maand (€)']].map(([k,lbl]) => (
                  <div key={k} style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>{lbl}</label>
                    <input value={editData[k]} onChange={e => setEditData(d => ({...d, [k]: e.target.value}))}
                      style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' }}/>
                  </div>
                ))}
                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                  <Button onClick={() => { Object.assign(selected, editData); setEditMode(false); }}>Opslaan</Button>
                  <Button variant="secondary" onClick={() => setEditMode(false)}>Annuleren</Button>
                </div>
              </div>
            ) : (
              <div>
                {[['E-mail','email'],['Telefoon','tel'],['Adres','adres'],['Woonplaats','postcode_plaats'],['IBAN','iban'],['Bedrag/maand','bedrag_maand'],['Lid sinds','startdatum']].map(([lbl,k]) => (
                  <StatRow key={k} label={lbl} value={k === 'bedrag_maand' ? eur(selected[k]) : selected[k]}/>
                ))}
                <div style={{ marginTop:20, display:'flex', gap:10 }}>
                  <Button onClick={() => setEditMode(true)}>✎ Bewerken</Button>
                  <Button variant="secondary" onClick={() => setSelected(null)}>Sluiten</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add new */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Nieuw lid toevoegen" width={480}>
        <div style={{ padding:24 }}>
          {[['naam','Naam'],['email','E-mail'],['tel','Telefoon'],['adres','Adres'],['postcode_plaats','Postcode & Woonplaats'],['iban','IBAN'],['bedrag_maand','Bedrag per maand (€)']].map(([k,lbl]) => (
            <div key={k} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>{lbl}</label>
              <input value={newDonor[k]} onChange={e => setNewDonor(d => ({...d, [k]: e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' }}/>
            </div>
          ))}
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <Button onClick={() => {
              window.DB.addDonor({ ...newDonor, type:'particulier', actief:true, startdatum: new Date().toISOString().split('T')[0], tags:[] });
              setAddOpen(false);
              setNewDonor({ naam:'', tel:'', adres:'', postcode_plaats:'', email:'', iban:'', bedrag_maand:'' });
            }}>Lid toevoegen</Button>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Annuleren</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Ondernemers Page ──────────────────────────────────────────────────────────
function OndernemersPage() {
  const [q, setQ] = useStateP('');
  const [selected, setSelected] = useStateP(null);
  const [addOpen, setAddOpen] = useStateP(false);
  const [newO, setNewO] = useStateP({ naam:'', tel:'', adres:'', postcode_plaats:'', email:'', iban:'', bedrag_maand:'', tags:'', spaarpot:false });
  const [, forceUpdate] = useStateP(0);

  const ondernemers = window.DB.donors.filter(d => d.type === 'ondernemer' &&
    (d.naam.toLowerCase().includes(q.toLowerCase()) || d.email.toLowerCase().includes(q.toLowerCase())));

  const cols = [
    { key:'naam', label:'Bedrijfsnaam', render:(v) => <span style={{fontWeight:600}}>{v}</span> },
    { key:'type', label:'Type', render:() => <Badge label="Ondernemer" color="blue"/> },
    { key:'email', label:'E-mail' },
    { key:'tel', label:'Telefoon' },
    { key:'bedrag_maand', label:'Per maand', render:v => <span style={{fontWeight:600,color:T.accentDark}}>{eur(v)}</span> },
    { key:'tags', label:'Sponsor', render:(v=[]) => (
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {v.map(t => <Badge key={t} label={t} color="grey" size="sm"/>)}
      </div>
    )},
    { key:'spaarpot', label:'Spaarpot', render:v => v
      ? <Badge label="✓ Spaarpot" color="accent"/>
      : <Badge label="Geen spaarpot" color="grey"/>
    },
  ];

  const inputSt = { width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:400 }}>Ondernemers</h1>
          <p style={{ fontSize:13, color:T.inkMuted, marginTop:4 }}>{ondernemers.length} zakelijke donors</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <SearchInput value={q} onChange={setQ} placeholder="Zoek op naam…"/>
          <Button onClick={() => setAddOpen(true)}>+ Ondernemer toevoegen</Button>
        </div>
      </div>
      <Card>
        <Table columns={cols} rows={ondernemers} onRowClick={r => setSelected({...r})}/>
      </Card>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.naam || ''} width={500}>
        {selected && (
          <div style={{ padding:24 }}>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <Badge label="Ondernemer" color="blue" size="md"/>
              {selected.spaarpot && <Badge label="✓ Spaarpot" color="accent" size="md"/>}
            </div>
            {[['E-mail','email'],['Telefoon','tel'],['Adres','adres'],['Woonplaats','postcode_plaats'],['IBAN','iban'],['Bedrag/maand','bedrag_maand'],['Donateur sinds','startdatum']].map(([lbl,k]) => (
              <StatRow key={k} label={lbl} value={k === 'bedrag_maand' ? eur(selected[k]) : selected[k]}/>
            ))}
            <StatRow label="Spaarpot" value={selected.spaarpot ? 'Ja' : 'Nee'}/>
            {selected.tags?.length > 0 && (
              <div style={{ marginTop:16 }}>
                <p style={{ fontSize:12, color:T.inkMuted, marginBottom:8, fontWeight:600 }}>SPONSOR / PROJECTEN</p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {selected.tags.map(t => <Badge key={t} label={t} color="accent"/>)}
                </div>
              </div>
            )}
            <div style={{ marginTop:20 }}>
              <Button variant="secondary" onClick={() => setSelected(null)}>Sluiten</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Ondernemer toevoegen" width={500}>
        <div style={{ padding:24 }}>
          {[['naam','Bedrijfsnaam'],['email','E-mail'],['tel','Telefoon'],['adres','Adres'],['postcode_plaats','Postcode & Woonplaats'],['iban','IBAN'],['bedrag_maand','Bedrag per maand (€)']].map(([k,lbl]) => (
            <div key={k} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>{lbl}</label>
              <input value={newO[k]} onChange={e => setNewO(d => ({...d, [k]: e.target.value}))} style={inputSt}/>
            </div>
          ))}
          {/* Sponsor tags */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>Sponsor / Projecten</label>
            <input value={newO.tags} onChange={e => setNewO(d => ({...d, tags: e.target.value}))} placeholder="Ramadan, Bouw, Evenementen (komma-gescheiden)" style={inputSt}/>
            <p style={{ fontSize:11, color:T.inkSubtle, marginTop:3 }}>Meerdere labels scheiden met komma's</p>
          </div>
          {/* Spaarpot toggle */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:8, fontWeight:600 }}>Spaarpot</label>
            <div style={{ display:'flex', gap:10 }}>
              {[true, false].map(val => (
                <label key={String(val)} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', border:`1.5px solid ${newO.spaarpot===val ? T.accent : T.border}`, borderRadius:T.radiusSm, background:newO.spaarpot===val ? T.accentLight : T.surface, cursor:'pointer', transition:'all 0.15s', flex:1, justifyContent:'center' }}>
                  <div style={{ width:15,height:15,borderRadius:'50%',border:`2px solid ${newO.spaarpot===val?T.accent:T.border}`,background:newO.spaarpot===val?T.accent:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    {newO.spaarpot===val && <div style={{width:5,height:5,borderRadius:'50%',background:'white'}}/>}
                  </div>
                  <span style={{ fontSize:13, fontWeight:500, color:T.ink }}>{val ? 'Ja — heeft spaarpot' : 'Nee — geen spaarpot'}</span>
                  <input type="radio" checked={newO.spaarpot===val} onChange={()=>setNewO(d=>({...d,spaarpot:val}))} style={{display:'none'}}/>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Button onClick={() => {
              window.DB.addDonor({
                ...newO,
                bedrag_maand: Number(newO.bedrag_maand) || 0,
                tags: newO.tags ? newO.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                type:'ondernemer', actief:true,
                startdatum: new Date().toISOString().split('T')[0],
              });
              setAddOpen(false);
              setNewO({ naam:'', tel:'', adres:'', postcode_plaats:'', email:'', iban:'', bedrag_maand:'', tags:'', spaarpot:false });
              forceUpdate(n => n+1);
            }}>Ondernemer toevoegen</Button>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Annuleren</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Donaties Page ─────────────────────────────────────────────────────────────
function DonatiePage() {
  const [q, setQ] = useStateP('');
  const [filterType, setFilterType] = useStateP('all');
  const [filterMethod, setFilterMethod] = useStateP('all');

  const donorMap = Object.fromEntries(window.DB.donors.map(d => [d.id, d.naam]));
  const all = window.DB.donations.map(d => ({
    ...d, donorNaam: donorMap[d.donorId] || '—',
  })).filter(d =>
    (filterType === 'all' || d.type === filterType) &&
    (filterMethod === 'all' || d.method === filterMethod) &&
    (d.donorNaam.toLowerCase().includes(q.toLowerCase()))
  ).sort((a,b) => b.date.localeCompare(a.date));

  const total = all.reduce((s,d) => s + d.amount, 0);

  const cols = [
    { key:'date', label:'Datum', render:v => <span style={{fontFamily:'monospace',fontSize:12}}>{v}</span> },
    { key:'donorNaam', label:'Donor', render:v => <span style={{fontWeight:600}}>{v}</span> },
    { key:'amount', label:'Bedrag', render:v => <span style={{fontWeight:700,color:T.accentDark}}>{eur(v)}</span> },
    { key:'method', label:'Methode', render:v => <Badge label={v === 'online' ? 'Online' : 'Contant'} color={v === 'online' ? 'accent' : 'warning'}/> },
    { key:'type', label:'Bron', render:v => <Badge label={v === 'stripe' ? 'Stripe' : 'Handmatig'} color={v === 'stripe' ? 'blue' : 'grey'}/> },
  ];

  const selStyle = { padding:'7px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:13, background:T.surface, color:T.ink, outline:'none', cursor:'pointer' };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:400 }}>Donaties</h1>
          <p style={{ fontSize:13, color:T.inkMuted, marginTop:4 }}>{all.length} transacties · totaal {eur(total)}</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <SearchInput value={q} onChange={setQ} placeholder="Zoek op naam…"/>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selStyle}>
            <option value="all">Alle bronnen</option>
            <option value="stripe">Stripe</option>
            <option value="cash">Handmatig</option>
          </select>
          <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} style={selStyle}>
            <option value="all">Alle methodes</option>
            <option value="online">Online</option>
            <option value="cash">Contant</option>
          </select>
        </div>
      </div>
      <Card>
        <Table columns={cols} rows={all}/>
      </Card>
    </div>
  );
}

// ── Toezeggingen Page ─────────────────────────────────────────────────────────
function ToezeggingPage() {
  const [promises, setPromises] = useStateP([...window.DB.promises]);
  const [addOpen, setAddOpen] = useStateP(false);
  const [newP, setNewP] = useStateP({ naam:'', bedrag:'', type:'cash', wanneer:'week', datum:'', status:'open' });

  const urgencyColor = (p) => {
    if (p.status === 'voldaan') return 'grey';
    if (p.wanneer === 'week') return 'error';
    if (p.wanneer === 'maand') return 'warning';
    return 'grey';
  };
  const urgencyLabel = { week:'Deze week', maand:'Deze maand', jaar:'Later' };

  const markDone = (id) => {
    const idx = promises.findIndex(p => p.id === id);
    if (idx >= 0) {
      const updated = [...promises];
      updated[idx] = {...updated[idx], status:'voldaan'};
      setPromises(updated);
      window.DB.promises[idx].status = 'voldaan';
    }
  };

  const openTotal = promises.filter(p => p.status === 'open').reduce((s,p) => s + Number(p.bedrag), 0);
  const weekCount = promises.filter(p => p.status === 'open' && p.wanneer === 'week').length;
  const maandCount = promises.filter(p => p.status === 'open' && p.wanneer === 'maand').length;

  const cols = [
    { key:'naam', label:'Naam', render:v => <span style={{fontWeight:600}}>{v}</span> },
    { key:'bedrag', label:'Bedrag', render:v => <span style={{fontWeight:700,color:T.accentDark}}>{eur(Number(v))}</span> },
    { key:'type', label:'Type', render:v => <Badge label={v === 'cash' ? 'Contant' : v === 'goud' ? '🪙 Goud' : 'Online'} color={v === 'cash' ? 'warning' : v === 'goud' ? 'accent' : 'blue'}/> },
    { key:'wanneer', label:'Wanneer', render:(v,r) => <Badge label={urgencyLabel[v]} color={urgencyColor(r)}/> },
    { key:'datum', label:'Datum', render:v => <span style={{fontFamily:'monospace',fontSize:12}}>{v}</span> },
    { key:'status', label:'Status', render:(v,r) => v === 'voldaan'
      ? <Badge label="✓ Voldaan" color="accent"/>
      : <Button size="sm" variant="secondary" onClick={() => markDone(r.id)}>Markeer voldaan</Button>
    },
  ];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:400 }}>Toezeggingen</h1>
          <p style={{ fontSize:13, color:T.inkMuted, marginTop:4 }}>Openstaand: {eur(openTotal)}</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>+ Toezegging toevoegen</Button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Deze week', value:weekCount, sub:'toezeggingen', color:T.error, bg:T.errorLight },
          { label:'Deze maand', value:maandCount, sub:'toezeggingen', color:T.warning, bg:T.warningLight },
          { label:'Later', value:promises.filter(p=>p.status==='open'&&p.wanneer==='jaar').length, sub:'toezeggingen', color:T.inkMuted, bg:T.bg },
        ].map(s => (
          <Card key={s.label} style={{ padding:'18px 20px', borderLeft:`3px solid ${s.color}`, background:s.bg }}>
            <div style={{ fontSize:11, fontWeight:600, color:s.color, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:6 }}>{s.label}</div>
            <StatNum value={s.value} size={28}/>
            <div style={{ fontSize:12, color:T.inkMuted, marginTop:2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <Card>
        <Table columns={cols} rows={promises}/>
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Toezegging toevoegen" width={440}>
        <div style={{ padding:24 }}>
          {[['naam','Naam'],['bedrag','Bedrag (€)']].map(([k,lbl]) => (
            <div key={k} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>{lbl}</label>
              <input value={newP[k]} onChange={e => setNewP(p => ({...p, [k]: e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' }}/>
            </div>
          ))}
          {[['type','Type',['cash','online','goud']],['wanneer','Wanneer',['week','maand','jaar']],['status','Status',['open','voldaan']]].map(([k,lbl,opts]) => (
            <div key={k} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>{lbl}</label>
              <select value={newP[k]} onChange={e => setNewP(p => ({...p, [k]: e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none', cursor:'pointer' }}>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>Datum</label>
            <input type="date" value={newP.datum} onChange={e => setNewP(p => ({...p, datum:e.target.value}))}
              style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' }}/>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <Button onClick={() => {
              const p = { id:`p${Date.now()}`, ...newP, bedrag: Number(newP.bedrag) };
              window.DB.promises.push(p);
              setPromises([...window.DB.promises]);
              setAddOpen(false);
              setNewP({ naam:'', bedrag:'', type:'cash', wanneer:'week', datum:'', status:'open' });
            }}>Toevoegen</Button>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Annuleren</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Evenementen Page ──────────────────────────────────────────────────────────
function EvenementenPage() {
  const [events, setEvents] = useStateP([...window.DB.events]);
  const [addOpen, setAddOpen] = useStateP(false);
  const [editEvent, setEditEvent] = useStateP(null);
  const [newEv, setNewEv] = useStateP({ titel:'', datum:'', type:'algemeen', beschrijving:'' });

  const sorted = [...events].sort((a,b) => a.datum.localeCompare(b.datum));
  const upcoming = sorted.filter(e => e.datum >= new Date().toISOString().split('T')[0]);
  const past = sorted.filter(e => e.datum < new Date().toISOString().split('T')[0]);

  const EventCard = ({ ev }) => (
    <Card style={{ padding:'18px 20px', marginBottom:10, display:'flex', alignItems:'flex-start', gap:16 }} hover onClick={() => setEditEvent({...ev})}>
      <div style={{ flexShrink:0, textAlign:'center', minWidth:44 }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.inkSubtle, textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {MONTHS_NL[Number(ev.datum.split('-')[1])-1]}
        </div>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:26, lineHeight:1, color:T.ink }}>
          {ev.datum.split('-')[2]}
        </div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <span style={{ fontWeight:600, fontSize:14, color:T.ink }}>{ev.titel}</span>
          <Badge label={ev.type} color={EVENT_COLORS[ev.type]}/>
        </div>
        <p style={{ fontSize:13, color:T.inkMuted, lineHeight:1.5 }}>{ev.beschrijving}</p>
      </div>
    </Card>
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:400 }}>Evenementen</h1>
        <Button onClick={() => setAddOpen(true)}>+ Evenement toevoegen</Button>
      </div>

      {upcoming.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:12, fontWeight:700, color:T.inkMuted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>Aankomend</h2>
          {upcoming.map(ev => <EventCard key={ev.id} ev={ev}/>)}
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h2 style={{ fontSize:12, fontWeight:700, color:T.inkMuted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>Verleden</h2>
          <div style={{ opacity:0.6 }}>{past.map(ev => <EventCard key={ev.id} ev={ev}/>)}</div>
        </div>
      )}

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Evenement toevoegen" width={440}>
        <div style={{ padding:24 }}>
          {[['titel','Titel'],['beschrijving','Beschrijving']].map(([k,lbl]) => (
            <div key={k} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>{lbl}</label>
              <input value={newEv[k]} onChange={e => setNewEv(p => ({...p, [k]: e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' }}/>
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>Datum</label>
            <input type="date" value={newEv.datum} onChange={e => setNewEv(p => ({...p, datum:e.target.value}))}
              style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>Type</label>
            <select value={newEv.type} onChange={e => setNewEv(p => ({...p, type:e.target.value}))}
              style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none', cursor:'pointer' }}>
              {['religieus','fundraising','algemeen'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Button onClick={() => {
              const ev = { id:`e${Date.now()}`, ...newEv };
              window.DB.events.push(ev);
              setEvents([...window.DB.events]);
              setAddOpen(false);
              setNewEv({ titel:'', datum:'', type:'algemeen', beschrijving:'' });
            }}>Toevoegen</Button>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Annuleren</Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editEvent} onClose={() => setEditEvent(null)} title="Evenement bewerken" width={440}>
        {editEvent && (
          <div style={{ padding:24 }}>
            {[['titel','Titel'],['beschrijving','Beschrijving']].map(([k,lbl]) => (
              <div key={k} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>{lbl}</label>
                <input value={editEvent[k]} onChange={e => setEditEvent(p => ({...p, [k]: e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' }}/>
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>Datum</label>
              <input type="date" value={editEvent.datum} onChange={e => setEditEvent(p => ({...p, datum:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none' }}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:T.inkMuted, marginBottom:4, fontWeight:600 }}>Type</label>
              <select value={editEvent.type} onChange={e => setEditEvent(p => ({...p, type:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, fontFamily:'var(--font-sans)', fontSize:14, background:T.bg, color:T.ink, outline:'none', cursor:'pointer' }}>
                {['religieus','fundraising','algemeen'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Button onClick={() => {
                const idx = events.findIndex(e => e.id === editEvent.id);
                if (idx >= 0) { const upd = [...events]; upd[idx] = editEvent; setEvents(upd); window.DB.events[idx] = editEvent; }
                setEditEvent(null);
              }}>Opslaan</Button>
              <Button variant="secondary" onClick={() => setEditEvent(null)}>Annuleren</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

Object.assign(window, { LedenPage, OndernemersPage, DonatiePage, ToezeggingPage, EvenementenPage, MONTHS_NL, MONTHS_FULL, EVENT_COLORS });
