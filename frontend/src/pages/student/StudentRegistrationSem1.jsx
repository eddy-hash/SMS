import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from '@heroicons/react/24/outline';

const StudentRegistrationSem1 = () => {
  const [electives, setElectives] = useState([]);
  const [selectedElectives, setSelectedElectives] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [registeredElectives, setRegisteredElectives] = useState(new Set());

  useEffect(() => {
    fetchAvailableElectives();
    fetchRegisteredElectives();
  }, []);

  const fetchAvailableElectives = async () => {
    try {
      const response = await api.get('/students/available-electives', {
        params: { semester: 1 }
      });
      setElectives(response.data.electives || []);
    } catch (err) {
      console.error('Failed to load electives:', err);
      setError('Could not load available electives. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredElectives = async () => {
    try {
      const response = await api.get('/students/registered-electives', {
        params: { semester: 1 }
      });
      const registeredIds = new Set(response.data.elective_ids || []);
      setRegisteredElectives(registeredIds);
    } catch (err) {
      console.error('Failed to load registered electives:', err);
    }
  };

  const toggleElective = (electiveId) => {
    if (registeredElectives.has(electiveId)) return;
    setSelectedElectives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(electiveId)) {
        newSet.delete(electiveId);
      } else {
        newSet.add(electiveId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (selectedElectives.size === 0) {
      setError('Please select at least one elective course.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        semester: 1,
        elective_ids: Array.from(selectedElectives)
      };
      await api.post('/students/register-electives', payload);
      setSuccess(`Successfully registered for ${selectedElectives.size} elective(s).`);
      setSelectedElectives(new Set());
      await fetchRegisteredElectives();
      await fetchAvailableElectives();
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getElectiveStatus = (electiveId) => {
    if (registeredElectives.has(electiveId)) return 'registered';
    if (selectedElectives.has(electiveId)) return 'selected';
    return 'available';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="h-7 w-7 text-blue-600" />
            Course Registration – Semester 1 (Electives)
          </h1>
          <p className="text-gray-500 mt-1">
            Choose your preferred elective subjects. You can select multiple courses.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <XCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {electives.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No elective courses available for Semester 1 at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {electives.map(elective => {
              const status = getElectiveStatus(elective.id);
              const isRegistered = status === 'registered';
              const isSelected = status === 'selected';
              return (
                <div
                  key={elective.id}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
                    isRegistered
                      ? 'border-green-200 bg-green-50/30'
                      : isSelected
                      ? 'border-blue-400 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{elective.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{elective.code}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {elective.credits} credits
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{elective.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{elective.department || 'General'}</span>
                      {!isRegistered && (
                        <button
                          onClick={() => toggleElective(elective.id)}
                          disabled={submitting}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <MinusCircleIcon className="h-4 w-4" />
                              Remove
                            </>
                          ) : (
                            <>
                              <PlusCircleIcon className="h-4 w-4" />
                              Select
                            </>
                          )}
                        </button>
                      )}
                      {isRegistered && (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                          <CheckCircleIcon className="h-4 w-4" />
                          Registered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedElectives.size > 0 && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Registering...
                </span>
              ) : (
                `Register ${selectedElectives.size} Elective(s)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRegistrationSem1;