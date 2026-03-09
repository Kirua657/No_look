import React from "react";
import WeeklyStats from "../../../components/maker/WeeklyStats";
import type { WeeklyStatsData } from "../../../types/toukei";

interface NotificationWeeklyStatsModalProps {
  show: boolean;
  emotionLabel: string;
  data: WeeklyStatsData;
  onClose: () => void;
}

const NotificationWeeklyStatsModal: React.FC<NotificationWeeklyStatsModalProps> = ({ show, emotionLabel, data, onClose }) => {
  if (!show) return null;
  return (
    <WeeklyStats emotionLabel={emotionLabel} data={data} onClose={onClose} />
  );
};

export default NotificationWeeklyStatsModal;
