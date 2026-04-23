// ── Mock Data ────────────────────────────────────────────────────────────────
// Unified donation model: amount, date, type (stripe/cash), donorId

window.DB = (() => {
  // Helper to build a particulier donor quickly
  const p = (id, naam, tel, adres, ppl, email, iban, bedrag, start) =>
    ({ id, naam, tel, adres, postcode_plaats: ppl, email, iban, type:'particulier', bedrag_maand: bedrag, startdatum: start, actief: true });

  const donors = [
    p('d1','Ahmed Yilmaz','06-12345678','Haaksbergerstraat 44','7513 EA Enschede','ahmed@example.nl','NL91ABNA0417164300',50,'2024-01-01'),
    p('d2','Fatima Al-Hassan','06-23456789','Oldenzaalsestraat 12','7514 DP Enschede','fatima@example.nl','NL29RABO0325742512',75,'2024-03-15'),
    p('d3','Mustafa Demir','06-34567890','Gronausestraat 7','7533 EA Enschede','mustafa@example.nl','NL69INGB0123456789',100,'2023-11-01'),
    p('d4','Zeynep Kaya','06-45678901','Wethouder Beverstraat 3','7511 BJ Enschede','zeynep@example.nl','NL20SNSB0000012345',25,'2024-06-01'),
    p('d5','Ibrahim Ozturk','06-56789012','Hengelosestraat 91','7521 AD Enschede','ibrahim@example.nl','NL49RABO0112233445',150,'2023-08-01'),
    p('d6','Merve Sahin','06-67890123','Zuiderval 60','7543 EZ Enschede','merve@example.nl','NL62ABNA0999888777',50,'2024-02-01'),
    p('d7','Yusuf Arslan','06-78901234','Roombeek 22','7523 WP Enschede','yusuf@example.nl','NL86INGB0002445588',200,'2023-05-01'),
    p('d8','Halime Celik','06-89012345','Lonneker Markweg 5','7524 AJ Enschede','halime@example.nl','NL43RABO0765432100',35,'2024-09-01'),
    p('d9','Ömer Kaplan','06-90123456','Van Loenshof 14','7511 GA Enschede','omer@example.nl','NL91ABNA0417120000',60,'2024-04-01'),
    p('d10','Ayse Yildiz','06-01234567','Deurningerstraat 33','7514 BK Enschede','ayse@example.nl','NL71SNSB0987654321',40,'2024-07-01'),
    // ── 100 extra leden (gezinnen herkenbaar aan achternaam) ──────────────────
    // Ozkan familie (4x €5)
    p('d11','Mehmet Ozkan','06-11000001','Roombeekstraat 3','7523 AA Enschede','mehmet.ozkan@example.nl','NL01ABNA0001000001',5,'2024-01-01'),
    p('d12','Elif Ozkan','06-11000002','Roombeekstraat 3','7523 AA Enschede','elif.ozkan@example.nl','NL01ABNA0001000002',5,'2024-01-01'),
    p('d13','Ali Ozkan','06-11000003','Roombeekstraat 3','7523 AA Enschede','ali.ozkan@example.nl','NL01ABNA0001000003',5,'2024-02-01'),
    p('d14','Selin Ozkan','06-11000004','Roombeekstraat 3','7523 AA Enschede','selin.ozkan@example.nl','NL01ABNA0001000004',5,'2024-02-01'),
    // Yilmaz familie (3x €5)
    p('d15','Hasan Yilmaz','06-11000005','Pijpenstraat 12','7514 AK Enschede','hasan.yilmaz@example.nl','NL01ABNA0001000005',5,'2024-03-01'),
    p('d16','Fatma Yilmaz','06-11000006','Pijpenstraat 12','7514 AK Enschede','fatma.yilmaz@example.nl','NL01ABNA0001000006',5,'2024-03-01'),
    p('d17','Burak Yilmaz','06-11000007','Pijpenstraat 12','7514 AK Enschede','burak.yilmaz@example.nl','NL01ABNA0001000007',5,'2024-04-01'),
    // Demir familie (2x €8)
    p('d18','Serkan Demir','06-11000008','Gronausestraat 22','7533 EB Enschede','serkan.demir@example.nl','NL01ABNA0001000008',8,'2023-12-01'),
    p('d19','Nilüfer Demir','06-11000009','Gronausestraat 22','7533 EB Enschede','nilufer.demir@example.nl','NL01ABNA0001000009',8,'2023-12-01'),
    // Celik familie (3x €10)
    p('d20','Tarık Celik','06-11000010','Lonneker Markweg 8','7524 AJ Enschede','tarik.celik@example.nl','NL01ABNA0001000010',10,'2024-01-15'),
    p('d21','Gülay Celik','06-11000011','Lonneker Markweg 8','7524 AJ Enschede','gulay.celik@example.nl','NL01ABNA0001000011',10,'2024-01-15'),
    p('d22','Emre Celik','06-11000012','Lonneker Markweg 8','7524 AJ Enschede','emre.celik@example.nl','NL01ABNA0001000012',10,'2024-02-01'),
    // Arslan familie (2x €7)
    p('d23','Kemal Arslan','06-11000013','Roombeek 30','7523 WP Enschede','kemal.arslan@example.nl','NL01ABNA0001000013',7,'2024-05-01'),
    p('d24','Sema Arslan','06-11000014','Roombeek 30','7523 WP Enschede','sema.arslan@example.nl','NL01ABNA0001000014',7,'2024-05-01'),
    // Kaya familie (5x €5)
    p('d25','Murat Kaya','06-11000015','Wethouder Beverstraat 9','7511 BK Enschede','murat.kaya@example.nl','NL01ABNA0001000015',5,'2024-06-01'),
    p('d26','Hatice Kaya','06-11000016','Wethouder Beverstraat 9','7511 BK Enschede','hatice.kaya@example.nl','NL01ABNA0001000016',5,'2024-06-01'),
    p('d27','Deniz Kaya','06-11000017','Wethouder Beverstraat 9','7511 BK Enschede','deniz.kaya@example.nl','NL01ABNA0001000017',5,'2024-06-15'),
    p('d28','Berk Kaya','06-11000018','Wethouder Beverstraat 9','7511 BK Enschede','berk.kaya@example.nl','NL01ABNA0001000018',5,'2024-07-01'),
    p('d29','Irem Kaya','06-11000019','Wethouder Beverstraat 9','7511 BK Enschede','irem.kaya@example.nl','NL01ABNA0001000019',5,'2024-07-01'),
    // Kaplan familie (2x €15)
    p('d30','Leyla Kaplan','06-11000020','Van Loenshof 16','7511 GA Enschede','leyla.kaplan@example.nl','NL01ABNA0001000020',15,'2024-04-01'),
    p('d31','Orhan Kaplan','06-11000021','Van Loenshof 16','7511 GA Enschede','orhan.kaplan@example.nl','NL01ABNA0001000021',15,'2024-04-01'),
    // Sahin familie (3x €5)
    p('d32','Tolga Sahin','06-11000022','Zuiderval 65','7543 EZ Enschede','tolga.sahin@example.nl','NL01ABNA0001000022',5,'2023-10-01'),
    p('d33','Esra Sahin','06-11000023','Zuiderval 65','7543 EZ Enschede','esra.sahin@example.nl','NL01ABNA0001000023',5,'2023-10-01'),
    p('d34','Alp Sahin','06-11000024','Zuiderval 65','7543 EZ Enschede','alp.sahin@example.nl','NL01ABNA0001000024',5,'2024-01-01'),
    // Al-Hassan familie (2x €20)
    p('d35','Omar Al-Hassan','06-11000025','Oldenzaalsestraat 14','7514 DP Enschede','omar.alhassan@example.nl','NL01ABNA0001000025',20,'2024-03-01'),
    p('d36','Nadia Al-Hassan','06-11000026','Oldenzaalsestraat 14','7514 DP Enschede','nadia.alhassan@example.nl','NL01ABNA0001000026',20,'2024-03-01'),
    // ── Overige leden ─────────────────────────────────────────────────────────
    p('d37','Burak Polat','06-11000027','Haaksbergerstraat 11','7513 EA Enschede','burak.polat@example.nl','NL01ABNA0001000027',30,'2024-01-01'),
    p('d38','Songül Polat','06-11000028','Haaksbergerstraat 11','7513 EA Enschede','songul.polat@example.nl','NL01ABNA0001000028',30,'2024-01-01'),
    p('d39','Riza Erdogan','06-11000029','Marktstraat 8','7511 GA Enschede','riza.erdogan@example.nl','NL01ABNA0001000029',20,'2024-02-01'),
    p('d40','Havva Erdogan','06-11000030','Marktstraat 8','7511 GA Enschede','havva.erdogan@example.nl','NL01ABNA0001000030',20,'2024-02-01'),
    p('d41','Caner Gündüz','06-11000031','Hengelosestraat 50','7521 AC Enschede','caner.gunduz@example.nl','NL01ABNA0001000031',45,'2023-07-01'),
    p('d42','Pınar Güler','06-11000032','Deurningerstraat 7','7514 BB Enschede','pinar.guler@example.nl','NL01ABNA0001000032',25,'2024-05-01'),
    p('d43','Volkan Şimşek','06-11000033','Gronausestraat 44','7533 EC Enschede','volkan.simsek@example.nl','NL01ABNA0001000033',15,'2024-08-01'),
    p('d44','Sevda Şimşek','06-11000034','Gronausestraat 44','7533 EC Enschede','sevda.simsek@example.nl','NL01ABNA0001000034',15,'2024-08-01'),
    p('d45','Arda Doğan','06-11000035','Pijpenstraat 5','7514 AH Enschede','arda.dogan@example.nl','NL01ABNA0001000035',10,'2024-09-01'),
    p('d46','Figen Doğan','06-11000036','Pijpenstraat 5','7514 AH Enschede','figen.dogan@example.nl','NL01ABNA0001000036',10,'2024-09-01'),
    p('d47','Uğur Öztürk','06-11000037','Roombeek 5','7523 WA Enschede','ugur.ozturk@example.nl','NL01ABNA0001000037',35,'2023-09-01'),
    p('d48','Serpil Öztürk','06-11000038','Roombeek 5','7523 WA Enschede','serpil.ozturk@example.nl','NL01ABNA0001000038',35,'2023-09-01'),
    p('d49','Hüseyin Güneş','06-11000039','Zuiderval 10','7543 EA Enschede','huseyin.gunes@example.nl','NL01ABNA0001000039',50,'2023-06-01'),
    p('d50','Yasemin Güneş','06-11000040','Zuiderval 10','7543 EA Enschede','yasemin.gunes@example.nl','NL01ABNA0001000040',50,'2023-06-01'),
    p('d51','Nail Aydın','06-11000041','Haaksbergerstraat 88','7513 EB Enschede','nail.aydin@example.nl','NL01ABNA0001000041',20,'2024-01-01'),
    p('d52','Zübeyde Aydın','06-11000042','Haaksbergerstraat 88','7513 EB Enschede','zubeyde.aydin@example.nl','NL01ABNA0001000042',20,'2024-01-01'),
    p('d53','Cevdet Yıldırım','06-11000043','Oldenzaalsestraat 60','7514 DQ Enschede','cevdet.yildirim@example.nl','NL01ABNA0001000043',15,'2024-03-01'),
    p('d54','Nuray Yıldırım','06-11000044','Oldenzaalsestraat 60','7514 DQ Enschede','nuray.yildirim@example.nl','NL01ABNA0001000044',15,'2024-03-01'),
    p('d55','Barış Korkmaz','06-11000045','Hengelosestraat 33','7521 AB Enschede','baris.korkmaz@example.nl','NL01ABNA0001000045',25,'2023-11-01'),
    p('d56','Leyla Korkmaz','06-11000046','Hengelosestraat 33','7521 AB Enschede','leyla.korkmaz@example.nl','NL01ABNA0001000046',25,'2023-11-01'),
    p('d57','Ferhat Aktaş','06-11000047','Lonneker Markweg 12','7524 AK Enschede','ferhat.aktas@example.nl','NL01ABNA0001000047',40,'2024-02-15'),
    p('d58','Müzeyyen Aktaş','06-11000048','Lonneker Markweg 12','7524 AK Enschede','muzeyyen.aktas@example.nl','NL01ABNA0001000048',40,'2024-02-15'),
    p('d59','Sinan Bulut','06-11000049','Roombeekstraat 22','7523 AB Enschede','sinan.bulut@example.nl','NL01ABNA0001000049',30,'2024-06-01'),
    p('d60','Hanife Bulut','06-11000050','Roombeekstraat 22','7523 AB Enschede','hanife.bulut@example.nl','NL01ABNA0001000050',30,'2024-06-01'),
    p('d61','Taner Çetin','06-11000051','Van Loenshof 20','7511 GB Enschede','taner.cetin@example.nl','NL01ABNA0001000051',20,'2024-07-01'),
    p('d62','Dilek Çetin','06-11000052','Van Loenshof 20','7511 GB Enschede','dilek.cetin@example.nl','NL01ABNA0001000052',20,'2024-07-01'),
    p('d63','Ramazan Kılıç','06-11000053','Gronausestraat 55','7533 ED Enschede','ramazan.kilic@example.nl','NL01ABNA0001000053',10,'2024-08-01'),
    p('d64','Selma Kılıç','06-11000054','Gronausestraat 55','7533 ED Enschede','selma.kilic@example.nl','NL01ABNA0001000054',10,'2024-08-01'),
    p('d65','Mevlüt Aslan','06-11000055','Pijpenstraat 20','7514 AL Enschede','mevlut.aslan@example.nl','NL01ABNA0001000055',55,'2023-04-01'),
    p('d66','Hatice Aslan','06-11000056','Pijpenstraat 20','7514 AL Enschede','hatice.aslan@example.nl','NL01ABNA0001000056',55,'2023-04-01'),
    p('d67','Gökhan Özdemir','06-11000057','Deurningerstraat 50','7514 BM Enschede','gokhan.ozdemir@example.nl','NL01ABNA0001000057',35,'2024-04-01'),
    p('d68','Songül Özdemir','06-11000058','Deurningerstraat 50','7514 BM Enschede','songul.ozdemir@example.nl','NL01ABNA0001000058',35,'2024-04-01'),
    p('d69','Necati Çakır','06-11000059','Haaksbergerstraat 77','7513 EC Enschede','necati.cakir@example.nl','NL01ABNA0001000059',15,'2024-09-01'),
    p('d70','Fatma Çakır','06-11000060','Haaksbergerstraat 77','7513 EC Enschede','fatma.cakir@example.nl','NL01ABNA0001000060',15,'2024-09-01'),
    p('d71','Emrah Yılmaz','06-11000061','Pijpenstraat 33','7514 AM Enschede','emrah.yilmaz2@example.nl','NL01ABNA0001000061',25,'2024-10-01'),
    p('d72','Seda Yılmaz','06-11000062','Pijpenstraat 33','7514 AM Enschede','seda.yilmaz@example.nl','NL01ABNA0001000062',25,'2024-10-01'),
    p('d73','Kamil Türk','06-11000063','Roombeek 44','7523 WQ Enschede','kamil.turk@example.nl','NL01ABNA0001000063',20,'2024-01-01'),
    p('d74','Gülsüm Türk','06-11000064','Roombeek 44','7523 WQ Enschede','gulsum.turk@example.nl','NL01ABNA0001000064',20,'2024-01-01'),
    p('d75','Fikret Acar','06-11000065','Zuiderval 30','7543 EB Enschede','fikret.acar@example.nl','NL01ABNA0001000065',45,'2023-08-01'),
    p('d76','Zehra Acar','06-11000066','Zuiderval 30','7543 EB Enschede','zehra.acar@example.nl','NL01ABNA0001000066',45,'2023-08-01'),
    p('d77','Oktay Koç','06-11000067','Van Loenshof 2','7511 GA Enschede','oktay.koc@example.nl','NL01ABNA0001000067',10,'2024-11-01'),
    p('d78','Sevim Koç','06-11000068','Van Loenshof 2','7511 GA Enschede','sevim.koc@example.nl','NL01ABNA0001000068',10,'2024-11-01'),
    p('d79','Mustafa Yurt','06-11000069','Gronausestraat 88','7533 EE Enschede','mustafa.yurt@example.nl','NL01ABNA0001000069',30,'2024-05-01'),
    p('d80','Ayhan Yurt','06-11000070','Gronausestraat 88','7533 EE Enschede','ayhan.yurt@example.nl','NL01ABNA0001000070',30,'2024-05-01'),
    p('d81','Kenan Işık','06-11000071','Haaksbergerstraat 22','7513 EA Enschede','kenan.isik@example.nl','NL01ABNA0001000071',15,'2025-01-01'),
    p('d82','Nursel Işık','06-11000072','Haaksbergerstraat 22','7513 EA Enschede','nursel.isik@example.nl','NL01ABNA0001000072',15,'2025-01-01'),
    p('d83','Tahsin Bozkurt','06-11000073','Oldenzaalsestraat 33','7514 DR Enschede','tahsin.bozkurt@example.nl','NL01ABNA0001000073',60,'2023-03-01'),
    p('d84','Pervin Bozkurt','06-11000074','Oldenzaalsestraat 33','7514 DR Enschede','pervin.bozkurt@example.nl','NL01ABNA0001000074',60,'2023-03-01'),
    p('d85','Cemil Demirci','06-11000075','Hengelosestraat 77','7521 AE Enschede','cemil.demirci@example.nl','NL01ABNA0001000075',20,'2024-06-01'),
    p('d86','Emine Demirci','06-11000076','Hengelosestraat 77','7521 AE Enschede','emine.demirci@example.nl','NL01ABNA0001000076',20,'2024-06-01'),
    p('d87','Adnan Başaran','06-11000077','Lonneker Markweg 3','7524 AH Enschede','adnan.basaran@example.nl','NL01ABNA0001000077',35,'2023-10-01'),
    p('d88','Rukiye Başaran','06-11000078','Lonneker Markweg 3','7524 AH Enschede','rukiye.basaran@example.nl','NL01ABNA0001000078',35,'2023-10-01'),
    p('d89','Turgut Gürbüz','06-11000079','Roombeekstraat 11','7523 AC Enschede','turgut.gurbuz@example.nl','NL01ABNA0001000079',25,'2024-08-15'),
    p('d90','Hatice Gürbüz','06-11000080','Roombeekstraat 11','7523 AC Enschede','hatice.gurbuz@example.nl','NL01ABNA0001000080',25,'2024-08-15'),
    p('d91','Yaşar Karataş','06-11000081','Van Loenshof 8','7511 GA Enschede','yasar.karatas@example.nl','NL01ABNA0001000081',10,'2025-02-01'),
    p('d92','Gönül Karataş','06-11000082','Van Loenshof 8','7511 GA Enschede','gonul.karatas@example.nl','NL01ABNA0001000082',10,'2025-02-01'),
    p('d93','Celalettin Öz','06-11000083','Gronausestraat 66','7533 EF Enschede','celalettin.oz@example.nl','NL01ABNA0001000083',50,'2023-07-01'),
    p('d94','Saniye Öz','06-11000084','Gronausestraat 66','7533 EF Enschede','saniye.oz@example.nl','NL01ABNA0001000084',50,'2023-07-01'),
    p('d95','Ercan Toprak','06-11000085','Haaksbergerstraat 55','7513 ED Enschede','ercan.toprak@example.nl','NL01ABNA0001000085',15,'2024-10-01'),
    p('d96','Münevver Toprak','06-11000086','Haaksbergerstraat 55','7513 ED Enschede','munevver.toprak@example.nl','NL01ABNA0001000086',15,'2024-10-01'),
    p('d97','Suat Bayram','06-11000087','Zuiderval 50','7543 EC Enschede','suat.bayram@example.nl','NL01ABNA0001000087',30,'2024-09-01'),
    p('d98','Fadime Bayram','06-11000088','Zuiderval 50','7543 EC Enschede','fadime.bayram@example.nl','NL01ABNA0001000088',30,'2024-09-01'),
    p('d99','İsmail Yıldız','06-11000089','Pijpenstraat 55','7514 AN Enschede','ismail.yildiz@example.nl','NL01ABNA0001000089',20,'2025-01-01'),
    p('d100','Melahat Yıldız','06-11000090','Pijpenstraat 55','7514 AN Enschede','melahat.yildiz@example.nl','NL01ABNA0001000090',20,'2025-01-01'),
    p('d101','Ahmet Şahin','06-11000091','Roombeek 60','7523 WR Enschede','ahmet.sahin@example.nl','NL01ABNA0001000091',25,'2024-03-01'),
    p('d102','Hamit Kurt','06-11000092','Deurningerstraat 15','7514 BC Enschede','hamit.kurt@example.nl','NL01ABNA0001000092',10,'2024-04-01'),
    p('d103','Zeliha Kurt','06-11000093','Deurningerstraat 15','7514 BC Enschede','zeliha.kurt@example.nl','NL01ABNA0001000093',10,'2024-04-01'),
    p('d104','Mehmet Ay','06-11000094','Van Loenshof 30','7511 GC Enschede','mehmet.ay@example.nl','NL01ABNA0001000094',40,'2023-05-01'),
    p('d105','Nazlı Ay','06-11000095','Van Loenshof 30','7511 GC Enschede','nazli.ay@example.nl','NL01ABNA0001000095',40,'2023-05-01'),
    p('d106','Bilal Çelik','06-11000096','Lonneker Markweg 20','7524 AL Enschede','bilal.celik@example.nl','NL01ABNA0001000096',15,'2025-03-01'),
    p('d107','Hatice Çelik','06-11000097','Lonneker Markweg 20','7524 AL Enschede','hatice.celik@example.nl','NL01ABNA0001000097',15,'2025-03-01'),
    p('d108','Nuri Yılmaz','06-11000098','Haaksbergerstraat 99','7513 EE Enschede','nuri.yilmaz@example.nl','NL01ABNA0001000098',5,'2025-02-01'),
    p('d109','Hacer Arslan','06-11000099','Roombeek 70','7523 WS Enschede','hacer.arslan@example.nl','NL01ABNA0001000099',7,'2025-01-01'),
    p('d110','Veli Koçak','06-11000100','Gronausestraat 100','7533 EG Enschede','veli.kocak@example.nl','NL01ABNA0001000100',12,'2024-12-01'),
    { id:'b1', naam:'Halal Slagerij Ata',tel:'053-1234567', adres:'Marktstraat 5',         postcode_plaats:'7511 GA Enschede', email:'info@slagerijata.nl', iban:'NL55ABNA0200000001', type:'ondernemer',  bedrag_maand:500, startdatum:'2023-01-01', actief:true,  tags:['Ramadan','Bouw'],          spaarpot:true  },
    { id:'b2', naam:'Reisbureau Anadolu',tel:'053-2345678', adres:'Gronausestraat 120',    postcode_plaats:'7533 EA Enschede', email:'info@anadolu.nl',     iban:'NL44RABO0300000002', type:'ondernemer',  bedrag_maand:300, startdatum:'2023-06-01', actief:true,  tags:['Evenementen'],             spaarpot:false },
    { id:'b3', naam:'Turkse Supermarkt Bozkurt',tel:'053-3456789',adres:'Pijpenstraat 88', postcode_plaats:'7514 AK Enschede', email:'info@bozkurt.nl',     iban:'NL77INGB0400000003', type:'ondernemer',  bedrag_maand:250, startdatum:'2024-01-01', actief:true,  tags:['Voedselbank','Ramadan'],    spaarpot:true  },
    { id:'b4', naam:'Bouwbedrijf Yilmaz',tel:'053-4567890', adres:'Industrieweg 14',      postcode_plaats:'7547 RB Enschede', email:'info@bouwbedrijfyilmaz.nl',iban:'NL88ABNA0500000004',type:'ondernemer',bedrag_maand:1000,startdatum:'2023-03-01',actief:true, tags:['Bouw','Infrastructuur'],   spaarpot:true  },
    { id:'b5', naam:'Restaurant Istanbul', tel:'053-5678901', adres:'Oldenzaalsestraat 45',postcode_plaats:'7514 DM Enschede', email:'info@istanbul.nl',    iban:'NL22RABO0600000005', type:'ondernemer',  bedrag_maand:200, startdatum:'2024-05-01', actief:true,  tags:['Iftar','Evenementen'],     spaarpot:false },
  ];

  // Generate donation history: Jan 2025 – Apr 2026
  const donations = [];
  let donId = 1;
  const months = [];
  for (let y = 2025; y <= 2026; y++) {
    const maxM = y === 2026 ? 4 : 12;
    for (let m = 1; m <= maxM; m++) months.push({y, m});
  }
  donors.forEach(d => {
    months.forEach(({y, m}) => {
      const start = new Date(d.startdatum);
      if (new Date(y, m-1) < start) return;
      // stripe (monthly recurring)
      donations.push({ id:`don${donId++}`, donorId:d.id, amount:d.bedrag_maand, date:`${y}-${String(m).padStart(2,'0')}-05`, type:'stripe', method:'online' });
    });
  });
  // Add some extra cash donations
  const cashExtras = [
    {donorId:'d3', amount:200, date:'2026-01-15', type:'cash', method:'cash'},
    {donorId:'d5', amount:500, date:'2026-02-20', type:'cash', method:'cash'},
    {donorId:'b1', amount:1500,date:'2026-03-10', type:'stripe',method:'online'},
    {donorId:'d7', amount:300, date:'2026-04-05', type:'cash', method:'cash'},
    {donorId:'b4', amount:2000,date:'2026-01-20', type:'stripe',method:'online'},
    {donorId:'d2', amount:150, date:'2025-12-24', type:'cash', method:'cash'},
    {donorId:'b2', amount:800, date:'2026-02-14', type:'stripe',method:'online'},
  ];
  cashExtras.forEach(e => donations.push({id:`don${donId++}`, ...e}));

  const events = [
    { id:'e1', titel:'Kermes Lente 2026',       datum:'2026-05-10', type:'fundraising', beschrijving:'Jaarlijkse lente kermes in de moskee.' },
    { id:'e2', titel:'Iftar Ramadan',            datum:'2026-04-28', type:'religieus',   beschrijving:'Gezamenlijke iftar voor leden en bezoekers.' },
    { id:'e3', titel:'Eid al-Adha (Offerfeest)', datum:'2026-06-07', type:'religieus',   beschrijving:'Offerfeest viering met gemeenschap.' },
    { id:'e4', titel:'Fundraiser Bouw 2e fase',  datum:'2026-05-25', type:'fundraising', beschrijving:'Inzamelingsavond voor de uitbreiding van de moskee.' },
    { id:'e5', titel:'Eid al-Fitr (Suikerfeest)',datum:'2026-03-30', type:'religieus',   beschrijving:'Suikerfeest viering.' },
    { id:'e6', titel:'Vrijwilligersdag',          datum:'2026-06-20', type:'algemeen',    beschrijving:'Dag voor alle vrijwilligers met programma en maaltijd.' },
    { id:'e7', titel:'Wintermarkt',              datum:'2026-12-13', type:'fundraising', beschrijving:'Jaarlijkse wintermarkt.' },
  ];

  const promises = [
    { id:'p1', naam:'Hassan Bulut',   bedrag:500,  type:'cash',   wanneer:'week',   datum:'2026-04-28', status:'open'    },
    { id:'p2', naam:'Selma Erdogan',  bedrag:1000, type:'online', wanneer:'maand',  datum:'2026-05-15', status:'open'    },
    { id:'p3', naam:'Kadir Polat',    bedrag:250,  type:'cash',   wanneer:'week',   datum:'2026-04-25', status:'open'    },
    { id:'p4', naam:'Nadia Şimşek',   bedrag:2000, type:'goud',   wanneer:'jaar',   datum:'2026-12-01', status:'open'    },
    { id:'p5', naam:'Recep Güler',    bedrag:750,  type:'cash',   wanneer:'maand',  datum:'2026-05-30', status:'open'    },
    { id:'p6', naam:'Hülya Doğan',    bedrag:300,  type:'online', wanneer:'week',   datum:'2026-04-22', status:'open'    },
    { id:'p7', naam:'Tarık Özdemir',  bedrag:5000, type:'goud',   wanneer:'jaar',   datum:'2027-01-01', status:'open'    },
    { id:'p8', naam:'Bouwbedrijf Yilmaz',bedrag:10000,type:'online',wanneer:'maand',datum:'2026-05-01',status:'open'   },
    { id:'p9', naam:'Emine Koca',     bedrag:150,  type:'cash',   wanneer:'week',   datum:'2026-04-23', status:'voldaan' },
    { id:'p10',naam:'Selin Arslan',   bedrag:400,  type:'online', wanneer:'maand',  datum:'2026-04-10', status:'voldaan' },
  ];

  // Helper: donations for a given year-month
  function donationsForMonth(y, m) {
    return donations.filter(d => {
      const [dy, dm] = d.date.split('-').map(Number);
      return dy === y && dm === m;
    });
  }
  function totalForMonth(y, m) {
    return donationsForMonth(y, m).reduce((s, d) => s + d.amount, 0);
  }
  function memberCount() {
    return donors.filter(d => d.actief && d.type === 'particulier').length;
  }
  function businessCount() {
    return donors.filter(d => d.actief && d.type === 'ondernemer').length;
  }
  function monthlyRecurring() {
    return donors.filter(d => d.actief).reduce((s, d) => s + d.bedrag_maand, 0);
  }

  return {
    donors,
    donations,
    events,
    promises,
    donationsForMonth,
    totalForMonth,
    memberCount,
    businessCount,
    monthlyRecurring,
    addDonation(don) { donations.push({ id:`don${donId++}`, ...don }); },
    addDonor(d) { donors.push({ id:`d${donors.length+1}`, ...d }); },
  };
})();
