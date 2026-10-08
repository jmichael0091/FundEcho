import React from 'react';
import { Building2, Globe, Users, Calendar, Hash, FileText } from 'lucide-react';
import { OrganizationInformation } from '../../../types/application';
import { Opportunity } from '../../../types';
import { AIAssistanceDropdown } from '../AIAssistanceDropdown';

interface OrganizationInfoStepProps {
  info: OrganizationInformation;
  opportunity: Opportunity;
  onChange: (updated: OrganizationInformation) => void;
}

export const OrganizationInfoStep: React.FC<OrganizationInfoStepProps> = ({
  info,
  opportunity,
  onChange,
}) => {
  const handleChange = (field: keyof OrganizationInformation, value: any) => {
    onChange({
      ...info,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Organization / Business Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Specify your executing entity, corporate registration, or institutional status.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="org-has-org-checkbox"
              checked={info.hasOrganization}
              onChange={(e) => handleChange('hasOrganization', e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Applying with Registered Entity
            </span>
          </label>
        </div>

        {!info.hasOrganization ? (
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Applying as an Individual or Unincorporated Initiative
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your application will be evaluated based on the Lead Applicant profile provided in the previous step. You can proceed to the next step.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Org Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organization / Company Name *
              </label>
              <input
                type="text"
                id="org-name-input"
                value={info.orgName}
                onChange={(e) => handleChange('orgName', e.target.value)}
                placeholder="e.g. EcoImpact Global Initiative Ltd."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Org Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Entity Type *
              </label>
              <select
                id="org-type-select"
                value={info.orgType}
                onChange={(e) => handleChange('orgType', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Non-Profit / NGO">Non-Profit / Non-Governmental Organization (NGO)</option>
                <option value="For-Profit Startup">For-Profit Startup / Early-Stage Venture</option>
                <option value="Social Enterprise">Social Enterprise / Benefit Corporation</option>
                <option value="Academic / Research Institution">Academic / Research Institution</option>
                <option value="Community-Based Organization (CBO)">Community-Based Organization (CBO)</option>
                <option value="Cooperative / Association">Cooperative / Association</option>
              </select>
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registration / Incorporation Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  id="org-regNumber-input"
                  value={info.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  placeholder="e.g. RC-1849204 or EIN 12-3456789"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Country of Registration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country of Registration
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  id="org-country-input"
                  value={info.countryOfRegistration}
                  onChange={(e) => handleChange('countryOfRegistration', e.target.value)}
                  placeholder="e.g. Nigeria, United States, Germany"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Year Established */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Year Established / Incorporated
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  id="org-year-input"
                  value={info.yearEstablished}
                  onChange={(e) => handleChange('yearEstablished', e.target.value)}
                  placeholder="e.g. 2021"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full-time Team / Staff Size
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  id="org-teamSize-select"
                  value={info.teamSize}
                  onChange={(e) => handleChange('teamSize', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1-4 members">1 - 4 members</option>
                  <option value="5-15 members">5 - 15 members</option>
                  <option value="16-50 members">16 - 50 members</option>
                  <option value="50+ members">50+ members</option>
                </select>
              </div>
            </div>

            {/* Website URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organization Website URL
              </label>
              <input
                type="url"
                id="org-website-input"
                value={info.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://myorganization.org"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Mission Statement with AI */}
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mission Statement & Core Purpose:
                </label>
                <AIAssistanceDropdown
                  fieldKey="organization_mission"
                  fieldLabel="Organization Mission"
                  currentValue={info.missionStatement}
                  opportunity={opportunity}
                  organizationName={info.orgName}
                  organizationType={info.orgType}
                  onApplyText={(newText, mode) => {
                    handleChange('missionStatement', mode === 'replace' ? newText : `${info.missionStatement}\n\n${newText}`.trim());
                  }}
                />
              </div>
              <textarea
                rows={3}
                id="org-mission-input"
                value={info.missionStatement}
                onChange={(e) => handleChange('missionStatement', e.target.value)}
                placeholder="Describe your organization's core mission, values, and geographic footprint..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
