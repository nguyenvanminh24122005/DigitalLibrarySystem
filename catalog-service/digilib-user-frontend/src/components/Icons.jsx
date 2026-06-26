import React from 'react';
import {
  BookOpen, Search, Star, Grid2X2, History, Heart, FileText, Bell, User, Home,
  BookMarked, Library, Calendar, CheckCircle2, RotateCcw, AlertTriangle, Info,
  Bookmark, Monitor, Leaf, BarChart3, Brain, FlaskConical, Landmark, Languages,
  Download, Eye, Clock, XCircle, Inbox, Lock, ServerCrash, FolderOpen, BookCopy
} from 'lucide-react';

export const Icons = {
  BookOpen, Search, Star, Grid2X2, History, Heart, FileText, Bell, User, Home,
  BookMarked, Library, Calendar, CheckCircle2, RotateCcw, AlertTriangle, Info,
  Bookmark, Monitor, Leaf, BarChart3, Brain, FlaskConical, Landmark, Languages,
  Download, Eye, Clock, XCircle, Inbox, Lock, ServerCrash, FolderOpen, BookCopy
};

export function CategoryIcon({ type, size = 24 }) {
  const map = {
    leaf: Leaf,
    monitor: Monitor,
    chart: BarChart3,
    book: BookOpen,
    brain: Brain,
    flask: FlaskConical,
    landmark: Landmark,
    languages: Languages
  };
  const Icon = map[type] || Grid2X2;
  return <Icon size={size} />;
}
