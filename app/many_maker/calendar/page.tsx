"use client";
import EducationBoardFrame from "../../../components/frame/EducationBoardFrame";
import EventCalendar, { Event } from "../../../components/maker/EventCalendar";
import { useState, useEffect } from "react";

export default function MakerCalendar() {
  const [events, setEvents] = useState<Event[]>([]);

  // サンプルイベントデータを初期化
  useEffect(() => {
  // NOTE: sample events removed to avoid showing test/maintenance notices to students.
  // In production, events should be loaded from backend or a shared data file.
  setEvents([]);
  }, []);

  // 新しいイベントを追加
  const handleEventAdd = (newEvent: Omit<Event, 'id'>) => {
    const eventWithId: Event = {
      ...newEvent,
      id: Date.now().toString()
    };
    setEvents(prevEvents => [...prevEvents, eventWithId]);
  };

  // イベント編集
  const handleEventEdit = (id: string, eventData: Omit<Event, "id">) => {
    setEvents(prevEvents => prevEvents.map(event => 
      event.id === id 
        ? { ...eventData, id } 
        : event
    ));
  };

  // イベント削除
  const handleEventDelete = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  return (
    <EducationBoardFrame>
      <div style={{ padding: "20px", height: "100%", overflow: "auto" }}>
        <EventCalendar 
          events={events} 
          onEventAdd={handleEventAdd}
          onEventEdit={handleEventEdit}
          onEventDelete={handleEventDelete}
        />
      </div>
    </EducationBoardFrame>
  );
}