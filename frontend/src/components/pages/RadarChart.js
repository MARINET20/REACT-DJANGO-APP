import React from 'react';
import { Radar } from 'react-chartjs-2';

const RadarChart = ({ labels, data }) => {
    const radarData = {
        labels: labels,
        datasets: [
            {
                label: 'Требования проекта ',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        maintainAspectRatio: true,
        scales: {
            r: {
                beginAtZero: true,
                min:50,
                pointLabels: {
                    color: "#00325c",
                    font: {
                        size: 13,
                        weight: 'bold',
                    },
                    callback: function (value, index, values) {
                        return value; // Добавьте символ процента к значению
                    },
                    display: true,
                    
                },
            },
        },
    };

 
    return <Radar data={radarData} options={options}/>;
};

export default RadarChart;