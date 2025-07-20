#pragma once
#include <memory>
#include <vector>
#include <string>

struct NewMesh {
    bool success;
    std::string message;
    std::unique_ptr<std::vector<std::vector<int>>> elements;
    std::unique_ptr<std::vector<std::vector<double>>> coordinates;
};
