"use client";
import DesktopFrame from "../../../components/frame/DesktopFrame";
import EventCalendar, { Event } from "../../../components/maker/EventCalendar";
import { useState, useEffect } from "react";

export default function MakerCalendar() {
  const [events, setEvents] = useState<Event[]>([]);

  // サンプルイベントデータを初期化
  useEffect(() => {
    setEvents([
      {
        id: "1",
        date: "2025-09-29",
        title: "システムメンテナンス",
        time: "14:00",
        description: "定期メンテナンス作業",
        color: "#ef4444"
      },
      {
        id: "2",
        date: "2025-09-30",
        title: "会議",
        time: "10:00",
        description: "月次進捗会議",
        color: "#3b82f6"
      }
    ]);
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
    <DesktopFrame>
      <div style={{ padding: "20px", height: "100%", overflow: "auto" }}>
        <EventCalendar 
          events={events} 
          onEventAdd={handleEventAdd}
          onEventEdit={handleEventEdit}
          onEventDelete={handleEventDelete}
        />
      </div>
    </DesktopFrame>
  );
}