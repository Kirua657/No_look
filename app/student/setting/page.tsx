
"use client";
import SettingMenu from "../../../components/frame/SettingMenu";
import "../../../styles/student-responsive.css";
import SmartphoneHeader from "../../../components/frame/SmartphoneHeader";
import StudentBell from "../../../components/student/StudentBell";
import StudentFooter from "../../../components/student/StudentFooter";

export default function Home() {
  return (
    <>
      <style jsx>{`
        .student-setting-root {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #001f3f;
        }
      `}</style>
      <div className="student-setting-root">
        <SmartphoneHeader />
        <div style={{ position: 'absolute', top: '25mm', right: '3mm', zIndex: 50 }}><StudentBell count={3} /></div>
        <main className="flex-1 flex flex-col" style={{ width: "100%", height: "100%", paddingTop: "calc(60px)", paddingBottom: 0, overflow: "auto" }}>
          <SettingMenu />
        </main>
        <StudentFooter />
      </div>
    </>
  );
}
