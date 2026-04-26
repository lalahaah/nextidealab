// seedDevlog.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// .env 파일에서 환경 변수 추출 (Vite 환경 변수 대응)
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const projects = [
  {
    name: "AI 광고 카피 생성기",
    description: "브랜드 키워드만으로 고성능 SNS 광고 카피를 3초 만에 생성하는 서비스",
    status: "live",
    tags: ["AI", "WEB", "MARKETING"],
    stack: ["OpenAI API", "React", "Firebase"],
    deployUrl: "https://ai-copy-gen.vercel.app",
    startedAt: new Date("2024-01-15"),
    revenue: 150000,
  },
  {
    name: "개인 개발 아카이브 대시보드",
    description: "진행 중인 모든 프로젝트의 상태와 빌드 로그를 투명하게 공개하는 대시보드",
    status: "building",
    tags: ["WEB", "ARCHIVE", "PRODUCTIVITY"],
    stack: ["Vite", "Tailwind CSS", "Firestore"],
    deployUrl: null,
    startedAt: new Date("2024-04-10"),
    revenue: 0,
  },
  {
    name: "스마트 습관 트래커",
    description: "사용자의 기상 시간과 루틴을 AI가 분석하여 최적의 스케줄을 제안",
    status: "idea",
    tags: ["AI", "MOBILE", "HEALTH"],
    stack: ["Flutter", "TensorFlow Lite", "Node.js"],
    deployUrl: null,
    startedAt: new Date("2024-05-01"),
    revenue: 0,
  }
];

async function seed() {
  console.log("Seeding started...");
  try {
    for (const project of projects) {
      const docRef = await addDoc(collection(db, 'devlog_projects'), {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added project: ${project.name} (ID: ${docRef.id})`);

      // 각 프로젝트당 테스트 로그 2개씩 추가
      await addDoc(collection(db, 'devlog_logs'), {
        projectId: docRef.id,
        projectName: project.name,
        message: `${project.name} 초기 아키텍처 설계 완료`,
        status: project.status,
        loggedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      await addDoc(collection(db, 'devlog_logs'), {
        projectId: docRef.id,
        projectName: project.name,
        message: `${project.name} 주요 기능 구현 시작`,
        status: project.status,
        loggedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    }
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
