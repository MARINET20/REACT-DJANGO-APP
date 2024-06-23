import React, { useEffect, useState } from 'react'
import SearchTeamLastPage from './SearchTeamLastPage';
import { API_URL } from '../..';
import {useParams} from 'react-router-dom';
import AuthContext from '../AuthContext';

const NextPageSearchTeam = () => {
    const { id } = useParams();
    const [selectedProject, setSelectedProject] = useState({});
    const [selectedDirection, setSelectedDirection] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formData, setFormData] = useState({});
    const [teams, setTeams] = useState(null);
    const [isShowDivTeam, setIsShowDivTeam] = useState(false);

    
    
    useEffect(() => {
        const fetchProject = async () => {
          try {
            const [res1, res2, res3] = await Promise.all([
                fetch(`${API_URL}/get-distinct-data`),
                fetch(`${API_URL}/get-courses-data`),
                fetch(`${API_URL}/filter/project/${id}`)
            ]);
            
            const [data1, data2, data3] = await Promise.all([res1.json(), res2.json(), res3.json()]);
            
            setSelectedProject({
                students: data1,
                directions: data1.map(item => item.direction),
                courses: data2.map(item => item.course),
                title: data3.title,
                count: data3.count,
                participants_count: data3.participants_count
            });

          } catch (error) {
            console.error(error);
          }
        };
        
        fetchProject();
    }, [id]);

    const handleDirectionChange = (event) => {
        setSelectedDirection(event.target.value);
    };
    
    const handleCourseChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    const handleChange = async (e) => {
        e.preventDefault();
        const direction= selectedDirection;
        const course = selectedCourse;
        const project_id = id;
        const count= selectedProject.count - selectedProject.participants_count

        if (count == 0){
            alert('Команда уже сформирована!')
        }

        try {
            const response = await fetch(`${API_URL}/search-team`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ direction, course, project_id, count }),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setTeams(data)
                setIsShowDivTeam(true)
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (!selectedProject) {
        return <div></div>;
    }

    return (
        <AuthContext.Consumer>
            {({ user }) => (
            <div className='container'>
                { isShowDivTeam ? (
                <div>
                    <SearchTeamLastPage teams={teams} project_id={id} title={selectedProject.title}/>
                </div>
                ) : (
                <div>
                    <div className='pt-30'>
                        <h1 className=" m-0"  style={{color: '#00AEEF'}}>Настройки проекта</h1>  
                    </div>
                    <div style={{ border: '1px solid #cccccc', display: 'flex', flexDirection: 'column', padding: '20px', borderRadius: '10px' }} className='mt-4'>
                        <div className='d-flex justify-content-between'>
                            <div>
                                <label className="form-label mt-3" style={{fontWeight: '600'}}>Название проекта: </label>
                                <div style={{ border: '1px solid #cccccc', padding: '15px'}}>
                                    {selectedProject.title}
                                </div>
                            </div>
                            <div style={{marginLeft:'20px'}}>
                                <label className="form-label mt-3" style={{fontWeight: '600'}}>Кол-во участников: </label>
                                <div style={{ border: '1px solid #cccccc', padding: '15px', alignItems: 'center'}}>
                                    {selectedProject.count - selectedProject.participants_count}
                                </div>
                            </div>
                        </div>
                        <div className='d-flex mt-3 justify-content-between'>
                            <div>
                                <label className="form-label mt-3" style={{fontWeight: '600'}}>Направление обучения:</label>
                                <br/>
                                <select style={{ padding: '10px', border: '1px solid #cccccc'}} value={selectedDirection} onChange={handleDirectionChange}>
                                <option value="null">--------</option>
                                    {selectedProject.directions && selectedProject.directions.length > 0 && (
                                        selectedProject.directions.map((direction, index) => (
                                            <option key={index} value={direction}>{direction}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="form-label mt-3" style={{fontWeight: '600'}} >Курс обучения:</label>
                                <br/>
                                <select style={{ padding: '10px', border: '1px solid #cccccc' }} value={selectedCourse} onChange={handleCourseChange}>
                                    <option value="null">--------</option>
                                    {selectedProject.courses && selectedProject.courses.length > 0 && (
                                        selectedProject.courses.map((course, index) => (
                                            <option key={index} value={course}>{course}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className='d-flex justify-content-end'>
                        <a
                            href='#'
                            className="btn-next mt-3 " 
                            onClick={handleChange}
                            >Сформировать&nbsp;команду
                        </a>
                    </div>
                </div>
                )}
            </div>
            )}
        </AuthContext.Consumer>
    )
}

export default NextPageSearchTeam