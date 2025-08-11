// MongoDB 초기화 스크립트
// wzdata 데이터베이스와 사용자 생성

// wzdata 데이터베이스로 전환
db = db.getSiblingDB('wzdata');

// 애플리케이션용 사용자 생성
db.createUser({
  user: 'wzuser',
  pwd: 'wzpassword',
  roles: [
    {
      role: 'readWrite',
      db: 'wzdata'
    }
  ]
});

// 샘플 컬렉션 생성 (선택적)
db.createCollection('cash');
db.createCollection('consume');
db.createCollection('eqp');
db.createCollection('etc');
db.createCollection('ins');
db.createCollection('map');
db.createCollection('mob');
db.createCollection('monsterbook');
db.createCollection('npc');
db.createCollection('pet');
db.createCollection('petdialog');
db.createCollection('skill');
db.createCollection('tooltiphelp');

print('MongoDB 초기화 완료');
print('데이터베이스: wzdata');
print('사용자: wzuser');
print('컬렉션들이 생성되었습니다.');
