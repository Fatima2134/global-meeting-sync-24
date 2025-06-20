
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface EmailTemplatesProps {
  onTemplateSelect: (subject: string, message: string) => void;
}

const EmailTemplates = ({ onTemplateSelect }: EmailTemplatesProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Email Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => onTemplateSelect(
              'Meeting Reminder',
              'This is a friendly reminder about our upcoming meeting. Please make sure to join on time. Looking forward to our discussion!'
            )}
          >
            Meeting Reminder Template
          </Button>
          <Button
            variant="outline"
            onClick={() => onTemplateSelect(
              'Meeting Follow-up',
              'Thank you for attending our meeting. Please find attached the meeting notes and action items. Let me know if you have any questions.'
            )}
          >
            Follow-up Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTemplates;
