"use client";

import { User, Bell, Lock, Globe, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-1">Manage your account preferences and system configuration.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation for Settings */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
            <SettingsNavItem icon={User} label="Profile" active />
            <SettingsNavItem icon={Bell} label="Notifications" />
            <SettingsNavItem icon={Lock} label="Security" />
            <SettingsNavItem icon={Globe} label="Regional" />
            <div className="pt-4 pb-2">
                <div className="text-xs font-semibold text-on-surface-variant/50 uppercase tracking-wider px-3">System</div>
            </div>
            <SettingsNavItem icon={Shield} label="Access Control" />
            <SettingsNavItem icon={Database} label="Data Sources" />
        </div>

        {/* Main Settings Panel */}
        <div className="flex-1 space-y-6">
            {/* Profile Section */}
            <section className="bg-surface border border-outline/10 rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                        JS
                    </div>
                    <div>
                        <button className="text-sm bg-surface-variant/30 hover:bg-surface-variant/50 text-on-surface px-3 py-1.5 rounded-lg transition-colors font-medium">
                            Change Avatar
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="First Name" defaultValue="John" />
                    <InputGroup label="Last Name" defaultValue="Smith" />
                    <InputGroup label="Email" defaultValue="john.smith@tf-icre.org" type="email" />
                    <InputGroup label="Role" defaultValue="Senior Analyst" disabled />
                </div>
            </section>

            {/* Notifications Section */}
            <section className="bg-surface border border-outline/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <div className="space-y-3">
                    <ToggleItem label="Email Alerts for High Risk Transactions" description="Receive an email immediately when a critical alert is generated." checked />
                    <ToggleItem label="Weekly Digest" description="Get a summary of your team's activity every Monday." checked />
                    <ToggleItem label="System Maintenance" description="Notifications about upcoming scheduled maintenance." />
                </div>
            </section>

             {/* Action Buttons */}
             <div className="flex justify-end gap-3 pt-4">
                <button className="px-4 py-2 text-on-surface-variant hover:text-on-surface font-medium">Cancel</button>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                    Save Changes
                </button>
             </div>
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({ icon: Icon, label, active }: any) {
    return (
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface'
        }`}>
            <Icon className="w-4 h-4" />
            {label}
        </button>
    )
}

function InputGroup({ label, type = "text", defaultValue, disabled }: any) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-on-surface-variant">{label}</label>
            <input 
                type={type} 
                defaultValue={defaultValue} 
                disabled={disabled}
                className="w-full bg-surface-variant/10 border border-outline/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    )
}

function ToggleItem({ label, description, checked }: any) {
    return (
        <div className="flex items-start justify-between">
            <div>
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-on-surface-variant">{description}</div>
            </div>
            <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${checked ? 'bg-primary' : 'bg-surface-variant'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'left-5' : 'left-1'}`} />
            </div>
        </div>
    )
}
