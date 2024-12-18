import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../service/axios_helper'
import { Link } from 'react-router-dom';
import '../../../styles/Student/StudentHome.css'

function StudentHome() {
  const [courses, setCourses] = useState([]);
  const [student, setStudent] = useState({});
  const [classes, setClasses] = useState({});
  const [subjects, setSubjects] = useState({});
  const [semester, setSemester] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, studentResponse] = await Promise.all([
          axiosInstance.get('/api/courses/user'),
          axiosInstance.get('/api/users/profile'),
        ]);

        setCourses(coursesResponse.data);
        setStudent(studentResponse.data);

        if (coursesResponse.data.length > 0) {
          //Use map to create an array of promises
          const classPromises = coursesResponse.data.map(course => axiosInstance.get(`/api/classes/${course.classId}`));
          const subjectPromises = coursesResponse.data.map(course => axiosInstance.get(`/api/subjects/${course.subjectId}`));
          const semesterPromise = axiosInstance.get(`/api/semesters/${coursesResponse.data[0].semesterId}`);

          const [classResults, subjectResults, semesterResult] = await Promise.all([
            Promise.all(classPromises),
            Promise.all(subjectPromises),
            semesterPromise,
          ]);

          // Create lookup objects for classes and subjects
          const classesObj = {};
          classResults.forEach(result => classesObj[result.data.id] = result.data);
          setClasses(classesObj);

          const subjectsObj = {};
          subjectResults.forEach(result => subjectsObj[result.data.id] = result.data);
          setSubjects(subjectsObj);

          setSemester(semesterResult.data);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className='student-home-container'>
      <div>
        <h2>Xin chào {student.firstName + " " + student.lastName}</h2>
      </div>
      <div>
        {courses.map((course, index) => (
          <div key={index} className='student-home-content'>
            <Link to={`/course/${course.id}`}>
              <h3>[{course.id}] - {subjects[course.subjectId]?.name}</h3>
              <p>Lớp: {classes[course.classId]?.name}</p>
              <p>Học kỳ: {semester.name}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentHome
