import React from 'react';
import { Radar } from 'react-chartjs-2';

const RadarChart = ({ labels, data }) => {
    const radarData = {
        labels: labels,
        datasets: [
            {
                label: 'Требования проекта',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
            },
        ],
    };

    const radarOptions = {
        scale: {
            ticks: {
                beginAtZero: true,
            },
        },
    };

    return <Radar data={radarData} options={radarOptions} />;
};

export default RadarChart;