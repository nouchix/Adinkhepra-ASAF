'use client'

import { useState } from 'react'
import { Search, FileText, Monitor, Plus, X, Folder, Play, Check, ShieldAlert } from 'lucide-react'

export function EnrollmentWizard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'subnet' | 'csv' | 'cloud' | 'manual'>('subnet')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#050c16] border border-[#1a9fe8]/30 rounded-xl w-[900px] max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Title */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#080f1c]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1a9fe8] rounded-sm flex items-center justify-center shadow-[0_0_8px_rgba(26,159,232,0.5)]">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>
            <span className="text-white text-xs font-semibold">Connect Assets — Enrollment Wizard</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-[#1a9fe8]/40 bg-[#080f1c]">
          <button 
            onClick={() => setActiveTab('subnet')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'subnet' ? 'text-[#4EAEF5] border-[#4EAEF5]' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
          >
            <Search className="w-4 h-4" /> Mode A — Subnet
          </button>
          <button 
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'csv' ? 'text-[#4EAEF5] border-[#4EAEF5]' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
          >
            <FileText className="w-4 h-4" /> Mode B — CSV
          </button>
          <button 
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'cloud' ? 'text-[#4EAEF5] border-[#4EAEF5]' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
          >
            <Monitor className="w-4 h-4" /> Mode C — Cloud
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'manual' ? 'text-[#4EAEF5] border-[#4EAEF5]' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
          >
            <Plus className="w-4 h-4" /> Mode D — Manual
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#050c16]">
          {activeTab === 'subnet' && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg mb-2">Subnet Discovery</h2>
              <p className="text-slate-300 text-sm mb-4">Enter a CIDR range. ASAF will scan for live hosts and identify their OS and STIG profile.</p>
              
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-4">
                  <label className="w-32 text-sm font-bold text-white shrink-0 text-right">CIDR Range</label>
                  <input type="text" placeholder="e.g. 192.168.1.0/24" className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 text-sm font-bold text-white shrink-0 text-right">Target Enclave</label>
                  <select className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none">
                    <option>Local Enclave</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-32 text-sm font-bold text-white shrink-0 text-right">Port Profile</label>
                  <select className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none">
                    <option>Standard (22, 80, 443, 3389, 5985)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-2">
                <button className="flex items-center gap-2 bg-[#1a9fe8] hover:bg-[#4EAEF5] text-white font-bold py-1.5 px-4 rounded text-sm transition-colors">
                  <Search className="w-4 h-4" /> Scan Subnet
                </button>
                <button className="flex items-center gap-2 bg-transparent text-slate-500 font-bold py-1.5 px-4 rounded text-sm transition-colors cursor-not-allowed">
                  <X className="w-4 h-4" /> Stop
                </button>
                <button className="flex items-center gap-2 bg-[#1a9fe8] hover:bg-[#4EAEF5] text-white font-bold py-1.5 px-4 rounded text-sm transition-colors ml-4">
                  Select All
                </button>
                <button className="flex items-center gap-2 bg-transparent text-slate-500 font-bold py-1.5 px-4 rounded text-sm transition-colors cursor-not-allowed">
                  <Check className="w-4 h-4" /> Enroll Selected
                </button>
              </div>

              <div className="mt-4 text-slate-300 text-sm">Ready.</div>

              <div className="mt-2 border border-slate-800 rounded min-h-[250px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 text-xs font-bold text-[#4EAEF5]">IP</th>
                      <th className="p-3 text-xs font-bold text-[#4EAEF5]">Hostname</th>
                      <th className="p-3 text-xs font-bold text-[#4EAEF5]">OS</th>
                      <th className="p-3 text-xs font-bold text-[#4EAEF5]">STIG Profile</th>
                      <th className="p-3 text-xs font-bold text-[#4EAEF5]">Ports</th>
                      <th className="p-3 text-xs font-bold text-[#4EAEF5]">Enroll?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Empty state */}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg mb-2">CSV Bulk Import</h2>
              <p className="text-slate-300 text-sm mb-4">Import a CSV file with asset inventory. Required: a hostname or IP column. Optional: os, enclave, stig_profile.</p>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#1a9fe8] hover:bg-[#4EAEF5] text-white font-bold py-2 px-4 rounded text-sm transition-colors">
                  <Folder className="w-4 h-4" /> Choose CSV File...
                </button>
                <button className="flex items-center gap-2 bg-slate-800 text-slate-500 font-bold py-2 px-4 rounded text-sm cursor-not-allowed">
                  <Check className="w-4 h-4" /> Import Assets
                </button>
              </div>
              <p className="text-slate-300 text-sm mt-4">No file selected.</p>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg mb-1">Cloud Asset Discovery</h2>
              <p className="text-[#f97316] font-bold text-xs uppercase tracking-wider mb-4">Coming in Future Release</p>
              
              <div className="bg-[#cc2a36]/10 border border-[#cc2a36]/30 rounded p-4 mb-6 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-[#cc2a36] flex-shrink-0" />
                <div className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">SEKHEM Gateway Encapsulation Required:</strong> All cloud discovery and polymophic API connections are routed exclusively through the PQC-WAF Blackhole-VPN. 
                  No data leaves your perimeter — the connector makes read-only API calls from your sovereign environment using your own credentials.
                </div>
              </div>

              <div className="text-sm text-slate-300 leading-relaxed space-y-3 mb-8">
                <p><strong className="text-white">AWS GovCloud</strong> and <strong className="text-white">Azure Government</strong> cloud asset discovery connectors are planned for the next release.</p>
                <p>When available, this mode will:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Pull EC2 instances from GovCloud via a read-only IAM role (no write permissions required)</li>
                  <li>Pull Azure VMs from GovCloud tenants via a service principal with Reader role</li>
                  <li>Auto-map instances to enclaves by VPC / resource group</li>
                  <li>Auto-detect OS and assign STIG profiles</li>
                </ul>
                <p>For now, enroll cloud assets using <strong>Mode B (CSV Import)</strong> with an exported asset inventory, or <strong>Mode D (Manual)</strong> for individual hosts.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="border border-slate-800 bg-[#0a1526] p-5 rounded">
                  <h3 className="text-white font-bold text-lg mb-1">AWS GovCloud EC2</h3>
                  <p className="text-slate-400 text-xs mb-4">IAM Role — Read Only</p>
                  <p className="text-slate-300 text-sm mb-4">Status: Not yet available</p>
                  <p className="text-slate-300 text-xs">Auth: IAM instance role or access key</p>
                </div>
                <div className="border border-slate-800 bg-[#0a1526] p-5 rounded">
                  <h3 className="text-white font-bold text-lg mb-1">Azure Gov VMs</h3>
                  <p className="text-slate-400 text-xs mb-4">Service Principal — Reader Role</p>
                  <p className="text-slate-300 text-sm mb-4">Status: Not yet available</p>
                  <p className="text-slate-300 text-xs">Auth: Azure service principal</p>
                </div>
                <div className="border border-[#cc2a36]/30 bg-[#1a0505] p-5 rounded relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#cc2a36] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">CUI RISK</div>
                  <h3 className="text-white font-bold text-lg mb-1">Commercial / Agnostic</h3>
                  <p className="text-slate-400 text-xs mb-4">Standard AWS / GCP / Azure</p>
                  <p className="text-slate-300 text-sm mb-4">Status: Not yet available</p>
                  <p className="text-[#f97316] text-[10px] leading-tight font-bold">WARNING: Scanning non-FedRAMP High / IL4 endpoints will automatically flag CUI/ITAR boundary violations in the Godfather Report.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg mb-2">Manual Asset Add</h2>
              <p className="text-slate-300 text-sm mb-4">Enter connection details for a single host. Use [Test Connection] to verify reachability before enrolling.</p>
              
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-4">
                  <label className="w-40 text-sm font-bold text-white shrink-0 text-right">Protocol</label>
                  <div className="flex-1 flex items-center gap-6 text-sm text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="protocol" defaultChecked className="accent-[#1a9fe8]" /> SSH (Linux / Unix)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="protocol" className="accent-[#1a9fe8]" /> WinRM (Windows)
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="w-40 text-sm font-bold text-white shrink-0 text-right">Host / IP</label>
                  <input type="text" placeholder="hostname or IP address" className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none" />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="w-40 text-sm font-bold text-white shrink-0 text-right">Port</label>
                  <input type="text" defaultValue="22" className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none" />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="w-40 text-sm font-bold text-white shrink-0 text-right">Auth Method</label>
                  <select className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none">
                    <option>Password</option>
                    <option>SSH Key</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="w-40 text-sm font-bold text-white shrink-0 text-right">Username</label>
                  <input type="text" placeholder="e.g. admin" className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none" />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="w-40 text-sm font-bold text-white shrink-0 text-right">Password / Passphrase</label>
                  <input type="password" placeholder="password or passphrase" className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none" />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="w-40 text-sm font-bold text-white shrink-0 text-right">SSH Key Path</label>
                  <input type="text" className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none" />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="w-40 text-sm font-bold text-white shrink-0 text-right">Target Enclave</label>
                  <select className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-sm text-white focus:border-[#4EAEF5] focus:outline-none">
                    <option>Local Enclave</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button className="flex items-center gap-2 bg-[#1a9fe8] hover:bg-[#4EAEF5] text-white font-bold py-2 px-5 rounded text-sm transition-colors">
                  <Play className="w-4 h-4 fill-current" /> Test Connection
                </button>
                <button className="flex items-center gap-2 bg-slate-800/80 text-slate-500 font-bold py-2 px-5 rounded text-sm cursor-not-allowed">
                  <Check className="w-4 h-4" /> Enroll Asset
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-[#050c16] border-t border-slate-800 p-2 text-center text-[10px] text-slate-500 font-mono">
          USPTO #73565085 | SecRed Knowledge Inc.
        </div>
      </div>
    </div>
  )
}
