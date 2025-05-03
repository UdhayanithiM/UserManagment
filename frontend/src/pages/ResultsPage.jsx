import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function ResultsPage() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/votes/results');
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);
        setResults(data.data);
      } catch (err) {
        toast.error('Failed to load results');
        console.error(err);
      }
    };

    fetchResults();
  }, []);

  const chartData = {
    labels: results.map((r) => r._id),
    datasets: [
      {
        label: 'Votes',
        data: results.map((r) => r.count),
        backgroundColor: ['#00bfff', '#ffa500', '#ff4d4d'],
      },
    ],
  };

  return (
    <div className="container">
      <h2>Voting Results</h2>
      <Bar data={chartData} />
    </div>
  );
}

export default ResultsPage;
