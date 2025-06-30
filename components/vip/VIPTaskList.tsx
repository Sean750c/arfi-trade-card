import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, CheckCircle, Circle } from 'lucide-react-native';

export interface VIPTask {
  task_name: string;
  value: number;
  is_get: boolean;
  isSellTask?: boolean;
}

interface VIPTaskListProps {
  tasks: VIPTask[];
  vipMainColor: string;
  onSellTaskPress: () => void;
}

const VIPTaskList: React.FC<VIPTaskListProps> = ({ tasks, vipMainColor, onSellTaskPress }) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: '#222', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 2 }}>Task List</Text>
      {tasks.map((task, idx) => {
        const isSellTask = !!task.isSellTask;
        const isCompleted = !!task.is_get;
        return (
          <TouchableOpacity
            key={isSellTask ? 'sell-task' : idx}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 14,
              marginBottom: 10,
              borderWidth: 1.2,
              borderColor: vipMainColor,
              backgroundColor: isCompleted ? `${vipMainColor}22` : '#fff',
              minHeight: 44,
            }}
            activeOpacity={0.85}
            onPress={isSellTask ? onSellTaskPress : undefined}
            disabled={isCompleted && !isSellTask}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
                backgroundColor: `${vipMainColor}18`,
              }}>
                {isSellTask ? (
                  <TrendingUp size={18} color={vipMainColor} />
                ) : isCompleted ? (
                  <CheckCircle size={18} color={'#4CAF50'} />
                ) : (
                  <Circle size={18} color={vipMainColor} />
                )}
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#222', flexShrink: 1 }}>
                {isSellTask ? 'Sell Card Task' : task.task_name}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
              {isSellTask ? (
                <View style={{ backgroundColor: vipMainColor, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>Go to Sell</Text>
                </View>
              ) : isCompleted ? (
                <Text style={{ color: '#4CAF50', fontSize: 13, fontWeight: 'bold', opacity: 0.85 }}>Completed</Text>
              ) : (
                <Text style={{ color: vipMainColor, fontSize: 13, fontWeight: 'bold' }}>+{task.value} EXP</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default VIPTaskList; 