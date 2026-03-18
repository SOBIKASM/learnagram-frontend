import './Navigation.css'
import { Route, Routes, NavLink } from 'react-router-dom'

import Assignments from "./Assignments"
import Notifications from "./Notifications"
import Message from "./Message"
import Curriculum from "./Curriculum"
import Profile from "./Profile"
import More from "./More"
import Create from "./Create"
import Home from "./Home"
import ClassroomList from './ClassroomList'
import CreateClassroom from './CreateClassroom'
import CreateAssignment from './CreateAssignment'
import DirectChat from './DirectChat';
import Semester from "../components/Semester";
import Classroom from "../components/Classroom"
// --- ICONS GROUPED BY LIBRARY ---

// IonIcons 5
import {
  IoHomeOutline, IoHome,
  IoDocumentOutline, IoDocument,
  IoMenu
} from "react-icons/io5";

// IonIcons (Standard/IOS)
import {
  IoIosNotificationsOutline, IoIosNotifications,
  IoIosAddCircleOutline, IoIosAddCircle
} from "react-icons/io";

import { TiGroupOutline, TiGroup } from "react-icons/ti";
import { PiBooksDuotone, PiBooksFill } from "react-icons/pi";
import { RiMessage3Fill, RiMessage3Line, RiCompass3Fill, RiCompass3Line, } from "react-icons/ri";
import { VscAccount } from "react-icons/vsc";
import Explore from './Explore'

function Navigation() {
  const getNavClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  const navItems = [
    { path: "home", label: "Home", icon: <IoHomeOutline />, activeIcon: <IoHome />, showOnMobile: true },
    { path: "classroom", label: "Classroom", icon: <TiGroupOutline />, activeIcon: <TiGroup />, showOnMobile: true },
    { path: "assignments", label: "Assignments", icon: <IoDocumentOutline />, activeIcon: <IoDocument />, showOnMobile: true },
    { path: "explore", label: "Explore", icon: <RiCompass3Line />, activeIcon: <RiCompass3Fill />, showOnMobile: false },
    { path: "notifications", label: "Notifications", icon: <IoIosNotificationsOutline />, activeIcon: <IoIosNotifications />, showOnMobile: false },
    { path: "create", label: "Create", icon: <IoIosAddCircleOutline />, activeIcon: <IoIosAddCircle />, showOnMobile: false },
    { path: "messages", label: "Message", icon: <RiMessage3Line />, activeIcon: <RiMessage3Fill />, showOnMobile: false },
    { path: "curriculum", label: "Curriculum", icon: <PiBooksDuotone />, activeIcon: <PiBooksFill />, showOnMobile: false },
    { path: "profile", label: "Profile", icon: <VscAccount />, activeIcon: <VscAccount />, showOnMobile: false },
    { path: "more", label: "More", icon: <IoMenu />, activeIcon: <IoMenu />, showOnMobile: true }
  ];

  const mobileVisibleItems = ["Home", "Classroom", "Assignments", "More"];

  return (
    <div>
      <div className="nav-container">
        <div className="nav-bar">
          <h2 className="logo">Learnagram</h2>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path === "" ? "/navigation" : `/navigation/${item.path}`}  // Changed from the complex condition to just item.path
              className={(navData) =>
                `${getNavClass(navData)} ${mobileVisibleItems.includes(item.label) ? "" : "hide-on-mobile"}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="nav-icon">
                    {isActive ? item.activeIcon : item.icon}
                  </span>
                  <div className='nav-label'>{item.label}</div>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="main-content">
          <Routes>
            <Route path='home' element={<Home />} />
            <Route path="classroom" element={<ClassroomList />} />
            <Route path="classroom/:classId" element={<Classroom />} />
            <Route path="classroom/create" element={<CreateClassroom />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/create" element={<CreateAssignment />} />
            <Route path="explore" element={<Explore />} />
            <Route path="create" element={<Create />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="messages" element={<Message />} />
            <Route path="curriculum" element={<Curriculum />} />
            <Route path="curriculum/sem/:id" element={<Semester />} />
            <Route path="profile" element={<Profile />} />
            <Route path="more" element={<More />} />
            <Route path="dm/:other_id" element={<DirectChat />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default Navigation