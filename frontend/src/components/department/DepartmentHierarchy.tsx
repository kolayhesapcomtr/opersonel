import { useState } from 'react';
import { Department } from '../../types';
import { Building2, ChevronRight, ChevronDown, Users } from 'lucide-react';

interface DepartmentHierarchyProps {
  departments: Department[];
}

interface DepartmentNode {
  department: Department;
  children: DepartmentNode[];
}

export default function DepartmentHierarchy({ departments }: DepartmentHierarchyProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build hierarchy tree
  const buildTree = (depts: Department[]): DepartmentNode[] => {
    const nodeMap = new Map<string, DepartmentNode>();
    const rootNodes: DepartmentNode[] = [];

    // Create nodes
    depts.forEach((dept) => {
      nodeMap.set(dept.id, { department: dept, children: [] });
    });

    // Build parent-child relationships
    depts.forEach((dept) => {
      const node = nodeMap.get(dept.id)!;
      if (dept.parentId) {
        const parentNode = nodeMap.get(dept.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (node: DepartmentNode, level: number = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(node.department.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.department.id}>
        <div
          className={`flex items-center py-3 px-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
            level > 0 ? 'ml-6' : ''
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => hasChildren && toggleNode(node.department.id)}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-6 h-6 flex items-center justify-center mr-2">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Department Icon */}
          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>

          {/* Department Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {node.department.name}
                </h4>
                {node.department.code && (
                  <p className="text-xs text-gray-500">{node.department.code}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 ml-4">
                {node.department.manager && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Yönetici:</span>{' '}
                    {node.department.manager.firstName} {node.department.manager.lastName}
                  </div>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <Users className="w-3 h-3 mr-1" />
                  {(node.department as any)._count?.employees || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(departments);

  if (departments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Henüz departman bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tree.map((node) => renderNode(node))}
    </div>
  );
}
