import React, { useEffect, useState } from 'react';
import { Filter, Search, Clock, CheckCircle } from 'lucide-react';
import useDataStore from '../store/dataStore';

const Employee = () => {
  const [activeTab, setActiveTab] = useState('joining');
  const [searchTerm, setSearchTerm] = useState('');
  const [joiningData, setJoiningData] = useState([]);
  const [leavingData, setLeavingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formatDOB = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return as-is if not a valid date
    }

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const fetchJoiningData = async () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbyWlc2CfrDgr1JGsJHl1N4nRf-GAR-m6yqPPuP8Oggcafv3jo4thFrhfAX2vnfSzLQLlg/exec?sheet=JOINING&action=fetch'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw JOINING API response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data from JOINING sheet');
      }

      // Handle both array formats (direct data or result.data)
      const rawData = result.data || result;

      if (!Array.isArray(rawData)) {
        throw new Error('Expected array data not received');
      }

      // Get headers from row 6 (index 5 in 0-based array)
      const headers = rawData[5];

      // Process data starting from row 7 (index 6)
      const dataRows = rawData.length > 6 ? rawData.slice(6) : [];

      const getIndex = (headerName) => {
        const index = headers.findIndex(h =>
          h && h.toString().trim().toLowerCase() === headerName.toLowerCase()
        );
        if (index === -1) {
          console.warn(`Column "${headerName}" not found in sheet`);
        }
        return index;
      };

      // NEW: Filter by Column B (index 1) - Employee ID column
      const columnBIndex = 1; // Column B index (Employee ID)

      const processedData = dataRows
        .map(row => ({
          employeeId: row[getIndex('Employee ID')] || '',
          candidateName: row[getIndex('Name As Per Aadhar')] || '',
          fatherName: row[getIndex('Father Name')] || '',
          dateOfJoining: row[getIndex('Date Of Joining')] || '',
          joiningPlace: row[getIndex('Joining Place')] || '',
          designation: row[getIndex('Designation')] || '',
          salary: row[getIndex('Salary')] || '',
          mobileNo: row[getIndex('Mobile No.')] || '',
          status: row[getIndex('Status')] || '',
          // Store Column B value for filtering
          columnB: row[columnBIndex]  // Column B value (Employee ID)
        }))
        // NEW FILTER: Only include rows where Column B (Employee ID) is NOT NULL
        .filter(item => item.columnB !== null && item.columnB !== undefined && item.columnB !== '');

      console.log('Processed JOINING data with Column B filter:', processedData);

      setJoiningData(processedData);

    } catch (error) {
      console.error('Error fetching joining data:', error);
      setError(error.message);
      toast.error(`Failed to load joining data: ${error.message}`);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const fetchLeavingData = async () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbyWlc2CfrDgr1JGsJHl1N4nRf-GAR-m6yqPPuP8Oggcafv3jo4thFrhfAX2vnfSzLQLlg/exec?sheet=LEAVING&action=fetch'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data from LEAVING sheet');
      }

      const rawData = result.data || result;

      if (!Array.isArray(rawData)) {
        throw new Error('Expected array data not received');
      }

      // Process data starting from row 7 (index 6) - skip headers
      const dataRows = rawData.length > 6 ? rawData.slice(6) : [];

      const processedData = dataRows
        .map(row => ({
          timestamp: row[0] || '',
          employeeId: row[1] || '', // Column B (index 1)
          name: row[2] || '',
          dateOfLeaving: row[3] || '',
          mobileNo: row[4] || '',
          reasonOfLeaving: row[5] || '',
          firmName: row[6] || '',
          fatherName: row[7] || '',
          dateOfJoining: row[8] || '',
          workingLocation: row[9] || '',
          designation: row[10] || '',
          salary: row[11] || '',
          plannedDate: row[12] || '', // Column M (index 12)
          actual: row[13] || ''       // Column N (index 13)
        }))
        // NEW FILTER: Only include rows where Column B (Employee ID) is NOT NULL
        .filter(item => item.employeeId !== null && item.employeeId !== undefined && item.employeeId !== '');

      console.log('Processed LEAVING data with Column B filter:', processedData);

      setLeavingData(processedData);

    } catch (error) {
      console.error('Error fetching leaving data:', error);
      setError(error.message);
      toast.error(`Failed to load leaving data: ${error.message}`);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchJoiningData();
    fetchLeavingData();
  }, []);

  const filteredJoiningData = joiningData.filter(item => {
    const matchesSearch = item.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const hasLeft = leavingData.some(leaving =>
      leaving.employeeId === item.employeeId &&
      leaving.plannedDate &&
      leaving.actual
    );
    return matchesSearch && !hasLeft;
  });

  const filteredLeavingData = leavingData.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const hasBothDates = item.plannedDate && item.actual;
    return matchesSearch && hasBothDates;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold ">Employee</h1>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by name, employee ID, or designation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300   rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white  text-gray-500 "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 " />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-300 ">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'joining'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('joining')}
            >
              <CheckCircle size={16} className="inline mr-2" />
              Joined ({filteredJoiningData.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'leaving'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('leaving')}
            >
              <Clock size={16} className="inline mr-2" />
              Left ({filteredLeavingData.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'joining' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white ">
                <thead className="bg-gray-100 ">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Of Joining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white ">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                          <span className="text-gray-600 text-sm">Loading pending calls...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <p className="text-red-500">Error: {error}</p>
                        <button
                          onClick={fetchLeavingData}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredJoiningData.map((item, index) => (
                    <tr key={index} className="hover:bg-white hover:bg-opacity-5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.employeeId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.candidateName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.dateOfJoining ? formatDOB(item.dateOfJoining) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.mobileNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fatherName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.joiningPlace || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.designation}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.salary}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!tableLoading && filteredJoiningData.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500 ">No joining employees found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaving' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white ">
                <thead className="bg-gray-100 ">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Of Joining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Of Leaving</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason Of Leaving</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white ">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                          <span className="text-gray-600 text-sm">Loading pending calls...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <p className="text-red-500">Error: {error}</p>
                        <button
                          onClick={fetchLeavingData}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredLeavingData.map((item, index) => (
                    <tr key={index} className="hover:bg-white ">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.employeeId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.dateOfJoining ? formatDOB(item.dateOfJoining) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.dateOfLeaving ? formatDOB(item.dateOfLeaving) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.mobileNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fatherName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.workingLocation || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.designation}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.salary}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reasonOfLeaving}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!tableLoading && filteredLeavingData.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500 ">No leaving employees found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employee;