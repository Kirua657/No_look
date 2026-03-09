"use client";
import "../../../styles/student-responsive.css";
import SmartphoneHeader from "../../../components/frame/SmartphoneHeader";
import StudentFooter from "../../../components/student/StudentFooter";
import Calendar from "../../../components/maker/Calendar";
import StudentBell from "../../../components/student/StudentBell";

export default function Home() {
  return (
    <>
      <style jsx>{`
        .student-time-root {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #fff;
        }
      `}</style>
      <div className="student-time-root">
        <SmartphoneHeader />
        <div style={{ position: 'absolute', top: '25mm', right: '3mm', zIndex: 50 }}><StudentBell count={3} /></div>
        <main className="flex-1 p-4 flex flex-col items-center justify-center" style={{ width: "100%", height: "100%", overflow: "auto" }}>
          <div style={{ marginTop: "-210px", paddingBottom: 0 }}>
            <Calendar />
          </div>
        </main>
        <StudentFooter />
      </div>
    </>
  );
}
