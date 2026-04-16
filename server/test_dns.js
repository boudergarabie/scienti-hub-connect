import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.resolveTxt('cluster0.skftiyn.mongodb.net', (err, records) => {
  if (err) {
    console.error('TXT Error:', err);
  } else {
    console.log('TXT Records:', records);
  }
});

dns.resolveSrv('_mongodb._tcp.cluster0.skftiyn.mongodb.net', (err, records) => {
  if (err) {
    console.error('SRV Error:', err);
  } else {
    console.log('SRV Records:', records);
  }
});
