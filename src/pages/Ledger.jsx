import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ledgerService } from '../services/misc';
import { ApiError } from '../services/api';
import { date, time, money } from '../utils/format';
import Spinner from '../components/ui/Spinner';
import './Ledger.css';

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLedgerData();
  }, []);

  const loadLedgerData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get balance
      try {
        const balanceRes = await ledgerService.getBalance();
        if (balanceRes.data && balanceRes.data.balance !== undefined) {
          setBalance(balanceRes.data.balance);
        } else if (balanceRes.data && balanceRes.data.data && balanceRes.data.data.balance !== undefined) {
          setBalance(balanceRes.data.data.balance);
        }
      } catch (balanceErr) {
        // Silent fail - balance will be 0
      }

      // Get entries
      try {
        const entriesRes = await ledgerService.getEntries();
        
        let data = [];
        if (entriesRes.data && entriesRes.data.data && Array.isArray(entriesRes.data.data)) {
          data = entriesRes.data.data;
        } else if (entriesRes.data && Array.isArray(entriesRes.data)) {
          data = entriesRes.data;
        } else if (entriesRes.data && entriesRes.data.entries && Array.isArray(entriesRes.data.entries)) {
          data = entriesRes.data.entries;
        }

        setEntries(data);
      } catch (entriesErr) {
        // Silent fail - entries will be empty
      }

    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load ledger data.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals from entries
  const totalCredits = entries
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const totalDebits = entries
    .filter(e => e.type === 'debit')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) {
    return (
      <div className="ledger-wrapper">
        <div className="center" style={{ padding: 'var(--space-8) 0' }}>
          <Spinner label="Loading ledger..." />
        </div>
      </div>
    );
  }

  return (
    <div className="ledger-wrapper">
      {/* Header */}
      <div className="ledger-header">
        <div>
          <p className="eyebrow">Financial</p>
          <h1>Ledger</h1>
          <p className="subtitle">View your transaction history and account balance</p>
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={loadLedgerData}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <div className="alert__content">
            <span className="alert__icon">⚠️</span>
            <span className="alert__message">{error}</span>
            <button 
              className="alert__close"
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="ledger-stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__top">
            <div className="stat-card__icon stat-card__icon--primary">💰</div>
          </div>
          <span className="stat-card__label">Current Balance</span>
          <span className="stat-card__value stat-card__value--large">
            {money(balance, 'PKR')}
          </span>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__top">
            <div className="stat-card__icon stat-card__icon--success">📈</div>
          </div>
          <span className="stat-card__label">Total Credits</span>
          <span className="stat-card__value">
            {money(totalCredits, 'PKR')}
          </span>
        </div>

        <div className="stat-card stat-card--danger">
          <div className="stat-card__top">
            <div className="stat-card__icon stat-card__icon--danger">📉</div>
          </div>
          <span className="stat-card__label">Total Debits</span>
          <span className="stat-card__value">
            {money(totalDebits, 'PKR')}
          </span>
        </div>
      </div>

      {/* Entries Table */}
      <div className="ledger-table-wrapper">
        <div className="ledger-table-header">
          <h3>Ledger Entries</h3>
          <span className="badge badge--primary">
            {entries.length} entries
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No transactions</h3>
            <p className="faint">Your ledger is empty. Transactions will appear here once you make bookings.</p>
          </div>
        ) : (
          <div className="table__scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Entry #</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="right">Amount</th>
                  <th className="right">Balance After</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry._id || entry.entryNumber}>
                    <td className="mono">
                      {entry.entryNumber || 'N/A'}
                    </td>
                    <td className="mono">
                      {date(entry.createdAt)} {time(entry.createdAt)}
                    </td>
                    <td>{entry.description || 'No description'}</td>
                    <td>
                      <span className={`badge badge--${entry.type === 'credit' ? 'success' : 'danger'}`}>
                        {entry.category?.toUpperCase() || entry.type?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className={`right mono ${entry.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                      {entry.type === 'credit' ? '+' : '-'}
                      {money(entry.amount || 0, entry.currency || 'PKR')}
                    </td>
                    <td className="right mono">
                      {money(entry.balanceAfter || 0, entry.currency || 'PKR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { ledgerService } from '../services/misc';
// import { ApiError } from '../services/api';
// import { date, time, money } from '../utils/format';
// import Spinner from '../components/ui/Spinner';
// import './Ledger.css';

// export default function Ledger() {
//   const [entries, setEntries] = useState([]);
//   const [balance, setBalance] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [usingSampleData, setUsingSampleData] = useState(false);

//   useEffect(() => {
//     loadLedgerData();
//   }, []);

//   const loadLedgerData = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       setUsingSampleData(false);

//       

//       // Get balance
//       try {
//         const balanceRes = await ledgerService.getBalance();
//         
//         if (balanceRes.data && balanceRes.data.balance !== undefined) {
//           setBalance(balanceRes.data.balance);
//         } else if (balanceRes.data && balanceRes.data.data && balanceRes.data.data.balance !== undefined) {
//           setBalance(balanceRes.data.data.balance);
//         }
//       } catch (balanceErr) {

//         // Don't set error - continue to try entries
//       }

//       // Get entries
//       try {
//         const entriesRes = await ledgerService.getEntries();
//         
        
//         // Extract data from different response formats
//         let data = [];
//         if (entriesRes.data && entriesRes.data.data && Array.isArray(entriesRes.data.data)) {
//           data = entriesRes.data.data;
//         } else if (entriesRes.data && Array.isArray(entriesRes.data)) {
//           data = entriesRes.data;
//         } else if (entriesRes.data && entriesRes.data.entries && Array.isArray(entriesRes.data.entries)) {
//           data = entriesRes.data.entries;
//         } else {
//           data = [];
//         }

//         

//         if (data && data.length > 0) {
//           setEntries(data);
//           setUsingSampleData(false);
//           
          
//           // If we got entries but no balance, calculate it
//           if (balance === 0) {
//             const total = data.reduce((sum, entry) => {
//               return entry.type === 'credit' 
//                 ? sum + entry.amount 
//                 : sum - entry.amount;
//             }, 0);
//             setBalance(total);
//           }
//           return; // Success - exit early
//         } else {

//         }
//       } catch (entriesErr) {

//       }

//       // If we get here, both APIs failed or returned empty

//       setUsingSampleData(true);
//       setEntries(getSampleEntries());
//       setBalance(36500);
//       // setError('Unable to load real data. Showing sample data.'); This is debug code

//     } catch (err) {

//       setUsingSampleData(true);
//       setEntries(getSampleEntries());
//       setBalance(36500);
//       setError(err instanceof ApiError ? err.message : 'Failed to load ledger data.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sample data for demo purposes
//   const getSampleEntries = () => {
//     return [
//       {
//         _id: '1',
//         entryNumber: 'LG-20260817-0001',
//         type: 'credit',
//         category: 'booking_payment',
//         amount: 12000,
//         currency: 'PKR',
//         balanceAfter: 12000,
//         description: 'Payment for booking BK-000004',
//         createdAt: new Date().toISOString(),
//       },
//       {
//         _id: '2',
//         entryNumber: 'LG-20260817-0002',
//         type: 'credit',
//         category: 'booking_payment',
//         amount: 36000,
//         currency: 'PKR',
//         balanceAfter: 48000,
//         description: 'Payment for booking BK-000003',
//         createdAt: new Date(Date.now() - 3600000).toISOString(),
//       },
//       {
//         _id: '3',
//         entryNumber: 'LG-20260817-0003',
//         type: 'debit',
//         category: 'refund',
//         amount: 9600,
//         currency: 'PKR',
//         balanceAfter: 38400,
//         description: 'Refund for cancelled booking BK-000004',
//         createdAt: new Date(Date.now() - 7200000).toISOString(),
//       },
//       {
//         _id: '4',
//         entryNumber: 'LG-20260816-0004',
//         type: 'debit',
//         category: 'cancellation_fee',
//         amount: 2400,
//         currency: 'PKR',
//         balanceAfter: 36000,
//         description: 'Cancellation fee for booking BK-000004',
//         createdAt: new Date(Date.now() - 86400000).toISOString(),
//       },
//       {
//         _id: '5',
//         entryNumber: 'LG-20260815-0005',
//         type: 'credit',
//         category: 'service_fee',
//         amount: 500,
//         currency: 'PKR',
//         balanceAfter: 36500,
//         description: 'Service fee adjustment',
//         createdAt: new Date(Date.now() - 172800000).toISOString(),
//       }
//     ];
//   };

//   // Calculate totals from entries
//   const totalCredits = entries
//     .filter(e => e.type === 'credit')
//     .reduce((sum, e) => sum + (e.amount || 0), 0);
  
//   const totalDebits = entries
//     .filter(e => e.type === 'debit')
//     .reduce((sum, e) => sum + (e.amount || 0), 0);

//   if (loading) {
//     return (
//       <div className="ledger-wrapper">
//         <div className="center" style={{ padding: 'var(--space-8) 0' }}>
//           <Spinner label="Loading ledger..." />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="ledger-wrapper">
//       {/* Header */}
//       <div className="ledger-header">
//         <div>
//           <p className="eyebrow">Financial</p>
//           <h1>Ledger</h1>
//           <p className="subtitle">
//             View your transaction history and account balance
//             {usingSampleData && (
//               <span style={{ 
//                 display: 'inline-block',
//                 marginLeft: 'var(--space-2)',
//                 padding: '2px 10px',
//                 background: 'var(--admin-warning-bg)',
//                 color: 'var(--admin-warning)',
//                 borderRadius: 'var(--admin-radius-sm)',
//                 fontSize: 'var(--font-xs)',
//                 fontWeight: 600
//               }}>
//                 ⚠️ Sample Data
//               </span>
//             )}
//           </p>
//         </div>
//         <button
//           className="btn btn--primary btn--sm"
//           onClick={loadLedgerData}
//         >
//           ↻ Refresh
//         </button>
//       </div>

//       {/* Error Alert */}
//       {error && (
//         <div className="alert alert--error">
//           <div className="alert__content">
//             <span className="alert__icon">⚠️</span>
//             <span className="alert__message">{error}</span>
//             <button 
//               className="alert__close"
//               onClick={() => setError('')}
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Balance Cards */}
//       <div className="ledger-stats">
//         <div className="stat-card stat-card--primary">
//           <div className="stat-card__top">
//             <div className="stat-card__icon stat-card__icon--primary">💰</div>
//           </div>
//           <span className="stat-card__label">Current Balance</span>
//           <span className="stat-card__value stat-card__value--large">
//             {money(balance, 'PKR')}
//           </span>
//         </div>

//         <div className="stat-card stat-card--success">
//           <div className="stat-card__top">
//             <div className="stat-card__icon stat-card__icon--success">📈</div>
//           </div>
//           <span className="stat-card__label">Total Credits</span>
//           <span className="stat-card__value">
//             {money(totalCredits, 'PKR')}
//           </span>
//         </div>

//         <div className="stat-card stat-card--danger">
//           <div className="stat-card__top">
//             <div className="stat-card__icon stat-card__icon--danger">📉</div>
//           </div>
//           <span className="stat-card__label">Total Debits</span>
//           <span className="stat-card__value">
//             {money(totalDebits, 'PKR')}
//           </span>
//         </div>
//       </div>

//       {/* Entries Table */}
//       <div className="ledger-table-wrapper">
//         <div className="ledger-table-header">
//           <h3>Ledger Entries</h3>
//           <span className="badge badge--primary">
//             {entries.length} entries
//           </span>
//         </div>

//         {entries.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-icon">📭</div>
//             <h3>No entries</h3>
//             <p className="faint">Your ledger is empty.</p>
//           </div>
//         ) : (
//           <div className="table__scroll">
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Entry #</th>
//                   <th>Date</th>
//                   <th>Description</th>
//                   <th>Category</th>
//                   <th className="right">Amount</th>
//                   <th className="right">Balance After</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {entries.map((entry) => (
//                   <tr key={entry._id || entry.entryNumber}>
//                     <td className="mono">
//                       {entry.entryNumber || 'N/A'}
//                     </td>
//                     <td className="mono">
//                       {date(entry.createdAt)} {time(entry.createdAt)}
//                     </td>
//                     <td>{entry.description || 'No description'}</td>
//                     <td>
//                       <span className={`badge badge--${entry.type === 'credit' ? 'success' : 'danger'}`}>
//                         {entry.category?.toUpperCase() || entry.type?.toUpperCase() || 'UNKNOWN'}
//                       </span>
//                     </td>
//                     <td className={`right mono ${entry.type === 'credit' ? 'text-success' : 'text-danger'}`}>
//                       {entry.type === 'credit' ? '+' : '-'}
//                       {money(entry.amount || 0, entry.currency || 'PKR')}
//                     </td>
//                     <td className="right mono">
//                       {money(entry.balanceAfter || 0, entry.currency || 'PKR')}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }