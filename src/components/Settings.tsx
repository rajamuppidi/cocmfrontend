'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Application Settings</h3>
                <p className="text-sm text-gray-600 mb-2">Configure global application settings</p>
                <Button variant="outline">Edit Configuration</Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Email Templates</h3>
                <p className="text-sm text-gray-600 mb-2">Customize system email templates</p>
                <Button variant="outline">Manage Templates</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Password Policy</h3>
                <p className="text-sm text-gray-600 mb-2">Configure password requirements and expiration</p>
                <Button variant="outline">Edit Policy</Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Access Controls</h3>
                <p className="text-sm text-gray-600 mb-2">Manage role permissions and access levels</p>
                <Button variant="outline">Configure Access</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Database Backup</h3>
                <p className="text-sm text-gray-600 mb-2">Configure automated backups</p>
                <Button variant="outline">Backup Settings</Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">System Logs</h3>
                <p className="text-sm text-gray-600 mb-2">View and download system logs</p>
                <Button variant="outline">View Logs</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Alert Settings</h3>
                <p className="text-sm text-gray-600 mb-2">Configure system alerts and notifications</p>
                <Button variant="outline">Configure Alerts</Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Messaging</h3>
                <p className="text-sm text-gray-600 mb-2">Configure SMS and email notification settings</p>
                <Button variant="outline">Message Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 